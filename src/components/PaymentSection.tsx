
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayPalOrderData } from "@/services/paypalService";
import { supabase } from "@/integrations/supabase/client";
import CreditCardForm from "./CreditCardForm";
import { Separator } from "@/components/ui/separator";

interface PaymentSectionProps {
  orderData: PayPalOrderData;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
  useRawHTML?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel,
  useRawHTML = true
}) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializePayPal = async () => {
      try {
        console.log('Initializing PayPal with order data:', orderData);
        
        // Reset states
        setPaypalError(null);
        setPaypalReady(false);

        // Clean up any existing PayPal instances
        if (paypalContainerRef.current) {
          paypalContainerRef.current.innerHTML = '';
        }

        // Remove existing PayPal script if any (safely)
        const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk/js"]');
        existingScripts.forEach(script => {
          try {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          } catch (error) {
            console.warn('Could not remove existing PayPal script:', error);
          }
        });

        // Clear any existing PayPal global object
        if ((window as any).paypal) {
          delete (window as any).paypal;
        }

        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!isMounted) return;

        // Get PayPal Client ID (sandbox for now)
        const clientId = "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
        
        // Create and inject PayPal SDK script
        const paypalScript = document.createElement('script');
        paypalScript.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${orderData.currency}&components=buttons&disable-funding=venmo,paylater&intent=capture`;
        paypalScript.async = true;
        
        paypalScript.onload = () => {
          console.log('PayPal SDK loaded successfully');
          
          if (!isMounted || !paypalContainerRef.current) {
            console.error('Component unmounted or PayPal container not available');
            return;
          }

          const container = paypalContainerRef.current;
          if (!container) {
            console.error('PayPal container reference lost');
            setPaypalError('PayPal container not found. Please refresh and try again.');
            return;
          }

          // Clear any existing content
          container.innerHTML = '';
          
          // Initialize PayPal buttons
          if ((window as any).paypal && isMounted) {
            try {
              (window as any).paypal.Buttons({
                style: {
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'paypal',
                  height: 45,
                  tagline: false
                },
                createOrder: function (data: any, actions: any) {
                  console.log('Creating PayPal order');
                  
                  return actions.order.create({
                    purchase_units: [{
                      amount: {
                        currency_code: orderData.currency,
                        value: orderData.amount
                      },
                      description: orderData.description || `${orderData.tier} Plan`,
                      custom_id: orderData.tier
                    }],
                    application_context: {
                      brand_name: 'Resume Builder',
                      landing_page: 'LOGIN',
                      user_action: 'PAY_NOW',
                      return_url: window.location.origin + '/subscription',
                      cancel_url: window.location.origin + '/subscription'
                    }
                  });
                },
                onApprove: function (data: any, actions: any) {
                  console.log('PayPal payment approved:', data);
                  setIsProcessing(true);
                  
                  return actions.order.capture().then(function(details: any) {
                    console.log('PayPal payment captured successfully:', details);
                    
                    const paymentResult = {
                      id: details.id,
                      status: details.status,
                      payer: details.payer,
                      purchase_units: details.purchase_units,
                      amount: orderData.amount,
                      currency: orderData.currency,
                      tier: orderData.tier,
                      payment_method: 'paypal'
                    };
                    
                    setIsProcessing(false);
                    onSuccess(paymentResult);
                  }).catch(function(error: any) {
                    console.error('Error capturing PayPal payment:', error);
                    setIsProcessing(false);
                    setPaypalError('Payment capture failed. Please try again or contact support.');
                    onError(error);
                  });
                },
                onError: function(err: any) {
                  console.error('PayPal error:', err);
                  setIsProcessing(false);
                  setPaypalError('PayPal payment failed. Please try again or use a different payment method.');
                  onError(err);
                },
                onCancel: function(data: any) {
                  console.log('PayPal payment cancelled:', data);
                  setIsProcessing(false);
                  onCancel();
                }
              }).render(container).then(() => {
                console.log('PayPal buttons rendered successfully');
                setPaypalReady(true);
                setPaypalError(null);
              }).catch((renderError: any) => {
                console.error('Error rendering PayPal buttons:', renderError);
                setPaypalError('Failed to load PayPal buttons. Please refresh and try again.');
              });

            } catch (initError) {
              console.error('Error initializing PayPal buttons:', initError);
              setPaypalError('Failed to initialize PayPal. Please refresh and try again.');
            }
          } else {
            console.error('PayPal SDK not available or component unmounted');
            setPaypalError('PayPal SDK failed to load. Please check your internet connection.');
          }
        };

        paypalScript.onerror = () => {
          console.error('Failed to load PayPal SDK');
          setPaypalError('Failed to load PayPal SDK. Please check your internet connection and try again.');
          onError(new Error('Failed to load PayPal SDK'));
        };

        document.head.appendChild(paypalScript);
      } catch (error) {
        console.error('Error initializing PayPal:', error);
        setPaypalError('Failed to initialize PayPal payment system.');
        onError(error);
      }
    };

    // Initialize PayPal with a delay to ensure DOM is ready
    const timer = setTimeout(initializePayPal, 100);

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timer);
      
      // Safe cleanup of PayPal container
      if (paypalContainerRef.current) {
        try {
          paypalContainerRef.current.innerHTML = '';
        } catch (error) {
          console.warn('Error cleaning up PayPal container:', error);
        }
      }
    };
  }, [orderData.amount, orderData.currency, orderData.tier, orderData.description]);

  const handleRetryPayPal = () => {
    setPaypalError(null);
    setPaypalReady(false);
    // Force re-initialization by updating a key prop or reloading
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Complete Your Payment</CardTitle>
        <div className="bg-muted p-3 rounded-lg mt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold">
              {orderData.currency === 'EGP' ? 'EGP' : '$'} {orderData.amount}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <span className="text-sm capitalize">{orderData.tier}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PayPal Payment Option */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-center">Pay with PayPal</h3>
          {paypalError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-600 text-sm mb-3">{paypalError}</p>
              <Button
                onClick={handleRetryPayPal}
                variant="outline"
                size="sm"
              >
                Retry PayPal
              </Button>
            </div>
          ) : (
            <div>
              <div 
                id="paypal-button-container" 
                ref={paypalContainerRef}
                className="min-h-[50px] flex items-center justify-center"
              >
                {!paypalReady && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading PayPal...</p>
                  </div>
                )}
              </div>
              {isProcessing && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Processing your PayPal payment...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
          </div>
        </div>

        {/* Credit Card Payment Option */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-center">Pay with Credit Card</h3>
          <CreditCardForm
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
            amount={parseFloat(orderData.amount)}
            currency={orderData.currency}
            symbol={orderData.currency === 'EGP' ? 'EGP' : '$'}
            selectedTier={orderData.tier}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
