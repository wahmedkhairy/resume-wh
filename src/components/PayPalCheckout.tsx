
import React, { useEffect, useRef, useState } from "react";
import { PayPalOrderData } from "@/services/paypalService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayPalCheckoutProps {
  orderData: PayPalOrderData;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        setIsLoading(true);
        
        console.log('Fetching PayPal configuration...');
        const { data: configData, error: configError } = await supabase.functions.invoke('get-paypal-config');
        
        if (configError) {
          console.error('Error fetching PayPal config:', configError);
          const errorMessage = configError.message || 'Failed to get PayPal configuration';
          toast({
            title: "PayPal Configuration Error",
            description: errorMessage,
            variant: "destructive",
          });
          throw new Error(errorMessage);
        }
        
        if (!configData?.success || !configData?.clientId) {
          console.error('Invalid PayPal config response:', configData);
          throw new Error('Invalid PayPal configuration');
        }
        
        const paypalClientId = configData.clientId;
        console.log('Using PayPal client ID:', paypalClientId.substring(0, 10) + '...');
        
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${orderData.currency}&intent=capture`;
        script.async = true;
        
        script.onload = () => {
          const paypalInstance = (window as any).paypal;
          if (paypalInstance && paypalRef.current) {
            paypalInstance.Buttons({
              createOrder: async () => {
                try {
                  console.log('Creating PayPal order with data:', orderData);
                  
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  const { data, error } = await supabase.functions.invoke('create-paypal-order', {
                    body: {
                      amount: orderData.amount,
                      currency: orderData.currency,
                      description: orderData.description,
                      tier: orderData.tier,
                      user_id: user?.id || null
                    }
                  });

                  if (error) {
                    console.error('Error creating PayPal order:', error);
                    let errorMessage = 'Failed to create payment order';
                    
                    // Provide specific error messages based on error type
                    if (error.message?.includes('invalid_client')) {
                      errorMessage = 'PayPal configuration error. Please check your PayPal settings.';
                    } else if (error.message?.includes('network')) {
                      errorMessage = 'Network error. Please check your internet connection.';
                    } else if (error.message?.includes('amount')) {
                      errorMessage = 'Invalid payment amount. Please try again.';
                    }
                    
                    toast({
                      title: "Payment Order Error",
                      description: errorMessage,
                      variant: "destructive",
                    });
                    throw new Error(errorMessage);
                  }
                  
                  console.log('PayPal order created:', data);
                  return data.orderId;
                } catch (error) {
                  console.error("Error creating order:", error);
                  onError(error);
                  throw error;
                }
              },
              onApprove: async (data: any) => {
                try {
                  console.log('PayPal payment approved:', data);
                  
                  const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
                    body: { 
                      orderId: data.orderID
                    }
                  });

                  if (error) {
                    console.error('Error capturing PayPal order:', error);
                    let errorMessage = 'Failed to process payment';
                    
                    // Provide specific error messages for capture errors
                    if (error.message?.includes('INSTRUMENT_DECLINED')) {
                      errorMessage = 'Your payment method was declined. Please try a different card or payment method.';
                    } else if (error.message?.includes('INSUFFICIENT_FUNDS')) {
                      errorMessage = 'Insufficient funds. Please check your account balance or try a different payment method.';
                    } else if (error.message?.includes('DUPLICATE_INVOICE_ID')) {
                      errorMessage = 'This payment has already been processed. Please refresh and try again.';
                    } else if (error.message?.includes('INVALID_ACCOUNT_STATUS')) {
                      errorMessage = 'There is an issue with your PayPal account. Please contact PayPal support.';
                    }
                    
                    toast({
                      title: "Payment Processing Error",
                      description: errorMessage,
                      variant: "destructive",
                    });
                    throw new Error(errorMessage);
                  }
                  
                  console.log('PayPal payment captured:', captureData);
                  onSuccess(captureData);
                } catch (error) {
                  console.error("Error capturing order:", error);
                  onError(error);
                }
              },
              onError: (error: any) => {
                console.error("PayPal error:", error);
                
                let errorMessage = "There was an error with PayPal. Please try again.";
                
                // Handle specific PayPal errors
                if (error?.message?.includes('popup_blocked')) {
                  errorMessage = "Popup was blocked. Please allow popups for this site and try again.";
                } else if (error?.message?.includes('network')) {
                  errorMessage = "Network connection error. Please check your internet and try again.";
                } else if (error?.message?.includes('declined')) {
                  errorMessage = "Payment was declined. Please check your payment details and try again.";
                }
                
                toast({
                  title: "PayPal Error",
                  description: errorMessage,
                  variant: "destructive",
                });
                onError(error);
              },
              onCancel: () => {
                console.log("PayPal payment cancelled");
                toast({
                  title: "Payment Cancelled",
                  description: "Your payment was cancelled.",
                });
                if (onCancel) {
                  onCancel();
                }
              },
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal'
              }
            }).render(paypalRef.current);
          }
          setIsLoading(false);
        };
        
        script.onerror = () => {
          setIsLoading(false);
          const error = new Error("Failed to load PayPal SDK - Invalid client ID or network issue");
          console.error("PayPal SDK loading error:", error);
          toast({
            title: "PayPal Loading Error",
            description: "Failed to load PayPal. Please check your internet connection and PayPal configuration.",
            variant: "destructive",
          });
          onError(error);
        };
        
        document.body.appendChild(script);
        
        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (error) {
        console.error("PayPal initialization error:", error);
        setIsLoading(false);
        onError(error);
      }
    };

    initializePayPal();
  }, [orderData, onSuccess, onError, onCancel, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading secure PayPal checkout...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div ref={paypalRef} />
      <p className="text-xs text-center text-muted-foreground">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default PayPalCheckout;
