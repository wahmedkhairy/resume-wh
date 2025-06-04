
import React, { useEffect, useRef } from "react";
import { PayPalService, PayPalOrderData } from "@/services/paypalService";
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
        const paypalService = PayPalService.getInstance();
        const initialized = await paypalService.initialize();
        
        if (!initialized) {
          throw new Error("Failed to initialize PayPal");
        }

        const paypal = paypalService.getPayPal();
        
        if (paypal && paypalRef.current) {
          paypal.Buttons({
            createOrder: async () => {
              try {
                return await paypalService.createOrder(orderData);
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
                const details = await paypalService.captureOrder(data.orderID);
                
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
                
                onSuccess(details);
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
