
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
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const initializePayPal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsInitialized(false);
        
        console.log('Initializing PayPal with order data:', orderData);
        
        // Clear any existing PayPal buttons
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }
        
        // Check if PayPal script is already loaded
        if ((window as any).paypal) {
          console.log('PayPal SDK already loaded, rendering buttons...');
          if (isMounted) {
            await renderPayPalButtons();
          }
          return;
        }
        
        console.log('Fetching PayPal configuration...');
        const { data: configData, error: configError } = await supabase.functions.invoke('get-paypal-config');
        
        if (configError) {
          console.error('Error fetching PayPal config:', configError);
          const errorMessage = 'Failed to load PayPal configuration. Please check your PayPal settings.';
          if (isMounted) {
            setError(errorMessage);
            toast({
              title: "PayPal Configuration Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return;
        }
        
        if (!configData?.success || !configData?.clientId) {
          console.error('Invalid PayPal config response:', configData);
          const errorMessage = 'Invalid PayPal configuration received.';
          if (isMounted) {
            setError(errorMessage);
            toast({
              title: "PayPal Configuration Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return;
        }
        
        const paypalClientId = configData.clientId;
        console.log('PayPal Client ID received:', paypalClientId.substring(0, 10) + '...');
        
        // Remove existing PayPal script if any
        const existingScript = document.querySelector('script[data-paypal-script="true"]');
        if (existingScript) {
          existingScript.remove();
        }
        
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${orderData.currency}&intent=capture&components=buttons`;
        script.async = true;
        script.setAttribute('data-paypal-script', 'true');
        
        script.onload = async () => {
          console.log('PayPal SDK loaded successfully');
          if (isMounted) {
            await renderPayPalButtons();
          }
        };
        
        script.onerror = () => {
          const errorMessage = "Failed to load PayPal SDK. Please check your internet connection and try again.";
          console.error("PayPal SDK loading error");
          if (isMounted) {
            setError(errorMessage);
            setIsLoading(false);
            toast({
              title: "PayPal Loading Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        };
        
        document.head.appendChild(script);
        
      } catch (error) {
        console.error("PayPal initialization error:", error);
        const errorMessage = "Failed to initialize PayPal. Please try again.";
        if (isMounted) {
          setError(errorMessage);
          setIsLoading(false);
          toast({
            title: "PayPal Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    };

    const renderPayPalButtons = async () => {
      return new Promise<void>((resolve, reject) => {
        const paypalInstance = (window as any).paypal;
        
        if (!paypalInstance) {
          console.error('PayPal instance not available');
          const error = 'PayPal SDK not loaded properly';
          setError(error);
          setIsLoading(false);
          reject(new Error(error));
          return;
        }

        if (!paypalRef.current) {
          console.error('PayPal ref not available');
          const error = 'PayPal container not ready';
          setError(error);
          setIsLoading(false);
          reject(new Error(error));
          return;
        }

        // Wait a bit to ensure the DOM is ready
        setTimeout(() => {
          if (!paypalRef.current || !isMounted) {
            reject(new Error('Component unmounted or ref not available'));
            return;
          }

          // Clear existing content
          paypalRef.current.innerHTML = '';

          console.log('Rendering PayPal buttons...');
          
          try {
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
                    throw new Error(error.message || 'Failed to create payment order');
                  }
                  
                  console.log('PayPal order created successfully:', data);
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
                    throw new Error(error.message || 'Failed to process payment');
                  }
                  
                  console.log('PayPal payment captured successfully:', captureData);
                  onSuccess(captureData);
                } catch (error) {
                  console.error("Error capturing order:", error);
                  onError(error);
                }
              },
              onError: (error: any) => {
                console.error("PayPal button error:", error);
                const errorMessage = "PayPal encountered an error. Please try again.";
                toast({
                  title: "PayPal Error",
                  description: errorMessage,
                  variant: "destructive",
                });
                onError(error);
              },
              onCancel: () => {
                console.log("PayPal payment cancelled by user");
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
            }).render(paypalRef.current).then(() => {
              console.log('PayPal buttons rendered successfully');
              if (isMounted) {
                setIsLoading(false);
                setIsInitialized(true);
              }
              resolve();
            }).catch((renderError: any) => {
              console.error('Error rendering PayPal buttons:', renderError);
              const error = 'Failed to render PayPal buttons';
              if (isMounted) {
                setError(error);
                setIsLoading(false);
                toast({
                  title: "PayPal Render Error",
                  description: "Failed to display PayPal buttons. Please refresh and try again.",
                  variant: "destructive",
                });
              }
              reject(renderError);
            });
          } catch (error) {
            console.error('Error setting up PayPal buttons:', error);
            if (isMounted) {
              setError('Failed to setup PayPal buttons');
              setIsLoading(false);
            }
            reject(error);
          }
        }, 100); // Small delay to ensure DOM is ready
      });
    };

    initializePayPal();
    
    return () => {
      isMounted = false;
      // Clean up PayPal script on unmount
      const existingScript = document.querySelector('script[data-paypal-script="true"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [orderData, onSuccess, onError, onCancel, toast]);

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <p className="font-medium">Payment System Error</p>
          <p className="text-sm">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    );
  }

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
      <div ref={paypalRef} className="min-h-[50px]" />
      {isInitialized && (
        <p className="text-xs text-center text-muted-foreground">
          Secure payment powered by PayPal
        </p>
      )}
    </div>
  );
};

export default PayPalCheckout;
