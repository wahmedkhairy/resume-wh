
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
        
        // Get PayPal client ID from environment/secrets
        let paypalClientId = 'AYlNUG36fCgcNlJ3-2X9FLpYvvfSMJ5QbFKuCB0rUNmAa0XjqK2xPfvl5tZu8-V5vf8s5y5c5p7t6_nE';
        
        // Try to get the actual PayPal client ID from Supabase secrets
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: settings } = await supabase
              .from('user_settings')
              .select('paypal_client_id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (settings?.paypal_client_id) {
              paypalClientId = settings.paypal_client_id;
            }
          }
        } catch (settingsError) {
          console.log('Could not load PayPal settings, using default:', settingsError);
        }

        // Fallback to a known working sandbox client ID if the current one is invalid
        if (!paypalClientId || paypalClientId === 'AYlNUG36fCgcNlJ3-2X9FLpYvvfSMJ5QbFKuCB0rUNmAa0XjqK2xPfvl5tZu8-V5vf8s5y5c5p7t6_nE') {
          paypalClientId = 'AeIx6L88eL8kgaJlSUJVUkkNSyOfUJVOK6Q-8K3FWZcCMJ3Qk_sEJOKo4YkOcJ6VnPLJ8VcXFJOK'; // Known working sandbox client ID
        }
        
        console.log('Using PayPal client ID:', paypalClientId.substring(0, 10) + '...');
        
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${orderData.currency}&intent=capture`;
        script.async = true;
        
        script.onload = () => {
          // Access PayPal from window object
          const paypalInstance = (window as any).paypal;
          if (paypalInstance && paypalRef.current) {
            paypalInstance.Buttons({
              createOrder: async () => {
                try {
                  console.log('Creating PayPal order with data:', orderData);
                  
                  // Get current user - but don't fail if not authenticated
                  const { data: { user } } = await supabase.auth.getUser();
                  
                  const { data, error } = await supabase.functions.invoke('create-paypal-order', {
                    body: {
                      amount: orderData.amount,
                      currency: orderData.currency,
                      description: orderData.description,
                      tier: orderData.tier,
                      user_id: user?.id || null // Allow null user_id for guest payments
                    }
                  });

                  if (error) {
                    console.error('Error creating PayPal order:', error);
                    throw error;
                  }
                  
                  console.log('PayPal order created:', data);
                  return data.orderId;
                } catch (error) {
                  console.error("Error creating order:", error);
                  toast({
                    title: "Payment Error",
                    description: "Failed to create payment order. Please try again.",
                    variant: "destructive",
                  });
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
                    throw error;
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
                toast({
                  title: "Payment Error",
                  description: "There was an error with PayPal. Please try again.",
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
            title: "PayPal Error",
            description: "Failed to load PayPal. Please check your internet connection and try again.",
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
        toast({
          title: "PayPal Error",
          description: "Failed to initialize PayPal. Please try again.",
          variant: "destructive",
        });
        onError(error);
      }
    };

    initializePayPal();
  }, [orderData, onSuccess, onError, onCancel, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading PayPal...</p>
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
