
import React, { useEffect, useRef, useState } from 'react';
import { PayPalService } from '@/services/paypalService';
import { useToast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  amount: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount = "2.00",
  onSuccess,
  onError
}) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paypalService] = useState(() => PayPalService.getInstance());
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const initializePayPal = async () => {
      try {
        console.log('Initializing PayPal service');
        const initialized = await paypalService.initialize();
        
        if (!initialized) {
          console.error('PayPal service initialization failed');
          setIsLoading(false);
          toast({
            title: "PayPal Error",
            description: "Failed to initialize PayPal. Please check your configuration.",
            variant: "destructive"
          });
          return;
        }

        if (!isMounted) return;

        const paypal = paypalService.getPayPal();
        if (!paypal || !paypalContainerRef.current) {
          console.error('PayPal SDK or container not available');
          setIsLoading(false);
          return;
        }

        // Clear any existing content
        paypalContainerRef.current.innerHTML = '';

        console.log('Rendering PayPal buttons for amount:', amount);
        
        paypal.Buttons({
          createOrder: async () => {
            try {
              console.log('Creating PayPal order...');
              const orderId = await paypalService.createOrder({
                amount,
                currency: "USD",
                description: `Payment for $${amount}`,
                tier: "basic"
              });
              console.log('Order created with ID:', orderId);
              return orderId;
            } catch (error) {
              console.error('Error creating order:', error);
              toast({
                title: "Order Creation Failed",
                description: "Failed to create PayPal order. Please try again.",
                variant: "destructive"
              });
              throw error;
            }
          },
          
          onApprove: async (data: any) => {
            try {
              console.log('PayPal payment approved, capturing order:', data.orderID);
              const details = await paypalService.captureOrder(data.orderID);
              console.log('Order captured successfully:', details);
              
              toast({
                title: "Payment Successful!",
                description: `Payment of $${amount} completed successfully.`,
              });

              if (onSuccess) {
                onSuccess(details);
              }
            } catch (error) {
              console.error('Error capturing order:', error);
              toast({
                title: "Payment Failed",
                description: "Payment approval failed. Please try again.",
                variant: "destructive"
              });
              
              if (onError) {
                onError(error);
              }
            }
          },

          onError: (err: any) => {
            console.error('PayPal error:', err);
            toast({
              title: "PayPal Error",
              description: "There was an error with PayPal. Please try again.",
              variant: "destructive"
            });
            
            if (onError) {
              onError(err);
            }
          },

          onCancel: (data: any) => {
            console.log('PayPal payment cancelled:', data);
            toast({
              title: "Payment Cancelled",
              description: "Your payment was cancelled.",
            });
          }
        }).render(paypalContainerRef.current);

        if (isMounted) {
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('Error initializing PayPal:', error);
        if (isMounted) {
          setIsLoading(false);
          toast({
            title: "PayPal Error",
            description: "Failed to load PayPal. Please refresh the page.",
            variant: "destructive"
          });
        }
      }
    };

    initializePayPal();

    return () => {
      isMounted = false;
    };
  }, [amount, paypalService, onSuccess, onError, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-300 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-sm text-gray-600">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        id="paypal-button-container" 
        ref={paypalContainerRef}
        className="min-h-[50px] w-full"
      />
      <p className="text-xs text-center text-gray-500 mt-2">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default PayPalButton;
