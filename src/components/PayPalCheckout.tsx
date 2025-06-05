
import React, { useEffect, useRef } from "react";
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
  const { toast } = useToast();

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        // Get PayPal settings to determine environment
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data: settings } = await supabase
          .from('user_settings')
          .select('paypal_client_id, paypal_production_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!settings?.paypal_client_id) {
          throw new Error("PayPal client ID not configured");
        }

        const isProduction = settings.paypal_production_mode || false;
        const environment = isProduction ? 'production' : 'sandbox';

        // Load PayPal SDK with appropriate environment
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${settings.paypal_client_id}&currency=${orderData.currency}&intent=capture&environment=${environment}`;
        script.async = true;
        
        script.onload = () => {
          if (window.paypal && paypalRef.current) {
            window.paypal.Buttons({
              createOrder: async () => {
                try {
                  const functionName = isProduction ? 
                    'create-paypal-order-production' : 
                    'create-paypal-order';

                  const { data, error } = await supabase.functions.invoke(functionName, {
                    body: {
                      amount: orderData.amount,
                      currency: orderData.currency,
                      description: orderData.description,
                      tier: orderData.tier,
                      user_id: user.id, // Include user ID for webhook processing
                      isProduction
                    }
                  });

                  if (error) throw error;
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
                  const functionName = isProduction ? 
                    'capture-paypal-order-production' : 
                    'capture-paypal-order';

                  const { data: captureData, error } = await supabase.functions.invoke(functionName, {
                    body: { 
                      orderId: data.orderID,
                      isProduction 
                    }
                  });

                  if (error) throw error;
                  
                  // Update user subscription
                  if (user) {
                    const scanCount = orderData.tier === 'basic' ? 2 : 
                                    orderData.tier === 'premium' ? 6 : 999;
                    
                    await supabase
                      .from('subscriptions')
                      .upsert({
                        user_id: user.id,
                        tier: orderData.tier,
                        status: 'active',
                        scan_count: scanCount,
                        max_scans: scanCount,
                        updated_at: new Date().toISOString()
                      });
                  }
                  
                  onSuccess(captureData);
                } catch (error) {
                  console.error("Error capturing order:", error);
                  onError(error);
                }
              },
              onError: (error: any) => {
                console.error("PayPal error:", error);
                onError(error);
              },
              onCancel: () => {
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
        };
        
        script.onerror = () => {
          throw new Error("Failed to load PayPal SDK");
        };
        
        document.body.appendChild(script);
        
        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };
      } catch (error) {
        console.error("PayPal initialization error:", error);
        toast({
          title: "PayPal Error",
          description: "Failed to load PayPal. Please check your settings and try again.",
          variant: "destructive",
        });
        onError(error);
      }
    };

    initializePayPal();
  }, [orderData, onSuccess, onError, onCancel, toast]);

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
