
import React, { useEffect, useRef, useState } from "react";
import { LivePayPalOrderData } from "@/services/livePayPalService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPayPalPricing, formatPayPalPrice } from "@/utils/paypalCurrencyUtils";

interface LivePayPalCheckoutProps {
  orderData: LivePayPalOrderData;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
  liveClientId: string;
}

const LivePayPalCheckout: React.FC<LivePayPalCheckoutProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel,
  liveClientId
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeLivePayPal = async () => {
      if (!liveClientId) {
        const error = new Error("Live PayPal Client ID is required");
        console.error(error);
        onError(error);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        console.log('Initializing Live PayPal with Client ID:', liveClientId.substring(0, 10) + '...');
        
        // Load PayPal SDK with live credentials
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${liveClientId}&currency=USD&intent=capture&environment=production`;
        script.async = true;
        
        script.onload = () => {
          const paypalInstance = (window as any).paypal;
          if (paypalInstance && paypalRef.current) {
            paypalInstance.Buttons({
              createOrder: async () => {
                try {
                  console.log('Creating live PayPal order:', orderData);
                  
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  const { data, error } = await supabase.functions.invoke('create-paypal-order-production', {
                    body: {
                      amount: orderData.amount,
                      currency: orderData.currency,
                      description: orderData.description,
                      tier: orderData.tier,
                      user_id: user?.id || null,
                      isProduction: true
                    }
                  });

                  if (error) {
                    console.error('Error creating live PayPal order:', error);
                    let errorMessage = 'Failed to create payment order';
                    
                    // Provide specific error messages based on error type
                    if (error.message?.includes('invalid_client')) {
                      errorMessage = 'Live PayPal configuration error. Please verify your live client ID.';
                    } else if (error.message?.includes('account_not_verified')) {
                      errorMessage = 'Your PayPal business account needs to be verified for live payments.';
                    } else if (error.message?.includes('permission_denied')) {
                      errorMessage = 'PayPal API permissions error. Please check your account settings.';
                    } else if (error.message?.includes('amount')) {
                      errorMessage = 'Invalid payment amount. Please contact support.';
                    }
                    
                    toast({
                      title: "Live Payment Order Error",
                      description: errorMessage,
                      variant: "destructive",
                    });
                    throw new Error(errorMessage);
                  }
                  
                  console.log('Live PayPal order created:', data);
                  return data.orderId;
                } catch (error) {
                  console.error("Error creating live order:", error);
                  onError(error);
                  throw error;
                }
              },
              onApprove: async (data: any) => {
                try {
                  console.log('Live PayPal payment approved:', data);
                  
                  const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order-production', {
                    body: { 
                      orderId: data.orderID,
                      isProduction: true
                    }
                  });

                  if (error) {
                    console.error('Error capturing live PayPal order:', error);
                    let errorMessage = 'Failed to process live payment';
                    
                    // Provide specific error messages for live capture errors
                    if (error.message?.includes('INSTRUMENT_DECLINED')) {
                      errorMessage = 'Your payment method was declined by your bank. Please contact your bank or try a different payment method.';
                    } else if (error.message?.includes('INSUFFICIENT_FUNDS')) {
                      errorMessage = 'Insufficient funds in your account. Please add funds or use a different payment method.';
                    } else if (error.message?.includes('EXPIRED_CARD')) {
                      errorMessage = 'Your card has expired. Please update your payment method.';
                    } else if (error.message?.includes('INVALID_ACCOUNT_STATUS')) {
                      errorMessage = 'There is an issue with your PayPal account status. Please contact PayPal support.';
                    } else if (error.message?.includes('TRANSACTION_LIMIT_EXCEEDED')) {
                      errorMessage = 'Transaction limit exceeded. Please contact PayPal to increase your limits.';
                    } else if (error.message?.includes('DUPLICATE_INVOICE_ID')) {
                      errorMessage = 'This payment has already been processed. Please contact support if you believe this is an error.';
                    }
                    
                    toast({
                      title: "Live Payment Processing Error",
                      description: errorMessage,
                      variant: "destructive",
                    });
                    throw new Error(errorMessage);
                  }
                  
                  console.log('Live PayPal payment captured:', captureData);
                  
                  toast({
                    title: "Payment Successful!",
                    description: "Your live payment has been processed successfully.",
                  });
                  
                  onSuccess(captureData);
                } catch (error) {
                  console.error("Error capturing live order:", error);
                  onError(error);
                }
              },
              onError: (error: any) => {
                console.error("Live PayPal error:", error);
                
                let errorMessage = "There was an error with live PayPal processing. Please try again.";
                
                // Handle specific live PayPal errors
                if (error?.message?.includes('popup_blocked')) {
                  errorMessage = "Popup was blocked. Please allow popups for this site and try again.";
                } else if (error?.message?.includes('network')) {
                  errorMessage = "Network connection error. Please check your internet connection.";
                } else if (error?.message?.includes('declined')) {
                  errorMessage = "Payment was declined by your financial institution. Please contact your bank.";
                } else if (error?.message?.includes('security')) {
                  errorMessage = "Security verification failed. Please verify your account with PayPal.";
                }
                
                toast({
                  title: "Live PayPal Error",
                  description: errorMessage,
                  variant: "destructive",
                });
                onError(error);
              },
              onCancel: () => {
                console.log("Live PayPal payment cancelled");
                toast({
                  title: "Payment Cancelled",
                  description: "Your live payment was cancelled.",
                });
                if (onCancel) {
                  onCancel();
                }
              },
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 45
              }
            }).render(paypalRef.current);
          }
          setIsLoading(false);
        };
        
        script.onerror = () => {
          setIsLoading(false);
          const error = new Error("Failed to load live PayPal SDK - Please check your live client ID and internet connection");
          console.error("Live PayPal SDK loading error:", error);
          toast({
            title: "Live PayPal Loading Error",
            description: "Failed to load live PayPal. Please verify your live PayPal configuration and internet connection.",
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
        console.error("Live PayPal initialization error:", error);
        setIsLoading(false);
        toast({
          title: "Live PayPal Error",
          description: "Failed to initialize live PayPal. Please check your configuration.",
          variant: "destructive",
        });
        onError(error);
      }
    };

    initializeLivePayPal();
  }, [orderData, onSuccess, onError, onCancel, liveClientId, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading Live PayPal (Production)...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
        <p className="text-sm text-green-800 font-medium">
          🔒 Live PayPal Payment - USD {formatPayPalPrice(parseFloat(orderData.amount))}
        </p>
        <p className="text-xs text-green-700">
          Secure live payment processing via PayPal Production
        </p>
      </div>
      <div ref={paypalRef} />
      <p className="text-xs text-center text-muted-foreground">
        Powered by PayPal - Production Environment
      </p>
    </div>
  );
};

export default LivePayPalCheckout;
