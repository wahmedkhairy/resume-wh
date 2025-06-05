
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
        // Load PayPal SDK with your client ID
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=AcHWJYj8MwqfRNnNPGQmkSuJnpXi1ZfJl6YwqRDR0CYmNnJ2tQ_1ybJhGr3hBb5QeTk-KzpL8QiHD5Fp&currency=${orderData.currency}`;
        script.async = true;
        
        script.onload = () => {
          if (window.paypal && paypalRef.current) {
            window.paypal.Buttons({
              createOrder: async () => {
                try {
                  const { data, error } = await supabase.functions.invoke('create-paypal-order', {
                    body: {
                      amount: orderData.amount,
                      currency: orderData.currency,
                      description: orderData.description,
                      tier: orderData.tier
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
                  const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
                    body: { orderId: data.orderID }
                  });

                  if (error) throw error;
                  
                  // Update user subscription
                  const { data: { user } } = await supabase.auth.getUser();
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
              }
            }).render(paypalRef.current);
          }
        };
        
        document.body.appendChild(script);
        
        return () => {
          document.body.removeChild(script);
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

  return <div ref={paypalRef} />;
};

export default PayPalCheckout;
