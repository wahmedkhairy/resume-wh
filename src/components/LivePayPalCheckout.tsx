
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
                  
                  // Get current user
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
                    throw error;
                  }
                  
                  console.log('Live PayPal order created:', data);
                  return data.orderId;
                } catch (error) {
                  console.error("Error creating live order:", error);
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
                  console.log('Live PayPal payment approved:', data);
                  
                  const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order-production', {
                    body: { 
                      orderId: data.orderID,
                      isProduction: true
                    }
                  });

                  if (error) {
                    console.error('Error capturing live PayPal order:', error);
                    throw error;
                  }
                  
                  console.log('Live PayPal payment captured:', captureData);
                  
                  toast({
                    title: "Payment Successful!",
                    description: "Your payment has been processed successfully.",
                  });
                  
                  onSuccess(captureData);
                } catch (error) {
                  console.error("Error capturing live order:", error);
                  toast({
                    title: "Payment Processing Error",
                    description: "Payment was approved but there was an issue processing it. Please contact support.",
                    variant: "destructive",
                  });
                  onError(error);
                }
              },
              onError: (error: any) => {
                console.error("Live PayPal error:", error);
                toast({
                  title: "Payment Error",
                  description: "There was an error with PayPal. Please try again.",
                  variant: "destructive",
                });
                onError(error);
              },
              onCancel: () => {
                console.log("Live PayPal payment cancelled");
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
                label: 'paypal',
                height: 45
              }
            }).render(paypalRef.current);
          }
          setIsLoading(false);
        };
        
        script.onerror = () => {
          setIsLoading(false);
          const error = new Error("Failed to load PayPal SDK - Please check your live client ID");
          console.error("Live PayPal SDK loading error:", error);
          toast({
            title: "PayPal Error",
            description: "Failed to load PayPal. Please check your live PayPal configuration.",
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
          title: "PayPal Error",
          description: "Failed to initialize live PayPal. Please try again.",
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
        <p className="text-sm text-muted-foreground">Loading Live PayPal...</p>
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
          Secure payment processing via PayPal
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
