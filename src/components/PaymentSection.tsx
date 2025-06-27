
import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayPalOrderData } from "@/services/paypalService";
import { supabase } from "@/integrations/supabase/client";

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
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }

    if (useRawHTML) {
      const initializePayPal = async () => {
        try {
          console.log('Initializing PayPal with order data:', orderData);
          
          // Remove existing PayPal script if any
          const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
          if (existingScript) {
            existingScript.remove();
          }

          // Get PayPal Client ID - using sandbox client ID that works
          const clientId = "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
          
          // Create and inject PayPal SDK script
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${orderData.currency}&disable-funding=credit,card&components=buttons`;
          script.async = true;
          
          script.onload = () => {
            console.log('PayPal SDK loaded successfully');
            
            // Ensure container is available
            if (!paypalContainerRef.current) {
              console.error('PayPal container not available');
              return;
            }

            // Clear any existing content
            paypalContainerRef.current.innerHTML = '';
            
            // Initialize PayPal buttons
            if ((window as any).paypal) {
              (window as any).paypal.Buttons({
                style: {
                  layout: 'vertical',
                  color: 'blue',
                  shape: 'rect',
                  label: 'paypal'
                },
                createOrder: async function (data: any, actions: any) {
                  try {
                    console.log('Creating PayPal order directly with PayPal API');
                    
                    // Create order directly with PayPal API instead of edge function
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
                        landing_page: 'NO_PREFERENCE',
                        user_action: 'PAY_NOW'
                      }
                    });
                  } catch (error) {
                    console.error('Failed to create PayPal order:', error);
                    if (onError) {
                      onError(error);
                    }
                    throw error;
                  }
                },
                onApprove: async function (data: any, actions: any) {
                  try {
                    console.log('PayPal payment approved:', data);
                    
                    // Capture the payment directly with PayPal
                    const details = await actions.order.capture();
                    console.log('PayPal payment captured successfully:', details);
                    
                    // Process the successful payment
                    const paymentResult = {
                      id: details.id,
                      status: details.status,
                      payer: details.payer,
                      purchase_units: details.purchase_units,
                      amount: orderData.amount,
                      currency: orderData.currency,
                      tier: orderData.tier
                    };
                    
                    if (onSuccess) {
                      onSuccess(paymentResult);
                    }
                  } catch (error) {
                    console.error('Error capturing PayPal payment:', error);
                    if (onError) {
                      onError(error);
                    }
                  }
                },
                onError: function(err: any) {
                  console.error('PayPal error:', err);
                  if (onError) {
                    onError(err);
                  }
                },
                onCancel: function(data: any) {
                  console.log('PayPal payment cancelled:', data);
                  if (onCancel) {
                    onCancel();
                  }
                }
              }).render(paypalContainerRef.current);

              isInitializedRef.current = true;
            }
          };

          script.onerror = () => {
            console.error('Failed to load PayPal SDK');
            if (onError) {
              onError(new Error('Failed to load PayPal SDK'));
            }
          };

          document.head.appendChild(script);
        } catch (error) {
          console.error('Error initializing PayPal:', error);
          if (onError) {
            onError(error);
          }
        }
      };

      initializePayPal();

      // Cleanup function
      return () => {
        const scriptToRemove = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
        isInitializedRef.current = false;
      };
    }
  }, [useRawHTML, orderData, onSuccess, onError, onCancel]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Secure Payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete your purchase with PayPal
        </p>
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
          <div className="text-xs text-muted-foreground mt-2">
            Processing via PayPal
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div style={{ marginTop: '20px' }}>
            <div 
              id="paypal-button-container" 
              ref={paypalContainerRef}
              className="min-h-[50px]"
            />
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            Secure payment powered by PayPal
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
