
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initPayPal = async () => {
      try {
        console.log('Initializing PayPal button...');
        
        const service = PayPalService.getInstance();
        const ok = await service.initialize();
        
        if (!ok) {
          console.error('PayPal service initialization failed');
          setIsLoading(false);
          toast({
            title: "PayPal Error",
            description: "Failed to initialize PayPal. Please check your configuration.",
            variant: "destructive"
          });
          return;
        }

        // Ensure container is available
        if (!containerRef.current) {
          console.error('PayPal container not available');
          setIsLoading(false);
          return;
        }

        const paypal = service.getPayPal();
        if (!paypal) {
          console.error('PayPal SDK not loaded');
          setIsLoading(false);
          return;
        }

        console.log('Rendering PayPal buttons...');

        const orderData = {
          amount,
          currency: "USD",
          description: `Payment for $${amount}`,
          tier: "basic"
        };

        // Clear any existing content
        containerRef.current.innerHTML = '';

        paypal.Buttons({
          createOrder: async () => {
            try {
              console.log('Creating PayPal order...');
              const orderId = await service.createOrder(orderData);
              console.log('Order created:', orderId);
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
              console.log('PayPal payment approved:', data.orderID);
              const capture = await service.captureOrder(data.orderID);
              console.log('Payment captured:', capture);
              
              toast({
                title: "Payment Successful!",
                description: `Payment of $${amount} completed successfully.`,
              });

              if (onSuccess) {
                onSuccess(capture);
              }
            } catch (error) {
              console.error('Error capturing payment:', error);
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
        }).render(containerRef.current);

        setIsInitialized(true);
        setIsLoading(false);
        console.log('PayPal buttons rendered successfully');
        
      } catch (error) {
        console.error('Error initializing PayPal:', error);
        setIsLoading(false);
        toast({
          title: "PayPal Error",
          description: "Failed to load PayPal. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initPayPal);
    } else {
      // DOM is already ready
      initPayPal();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initPayPal);
    };
  }, [amount, onSuccess, onError, toast]);

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
        ref={containerRef}
        className="min-h-[50px] w-full"
      />
      <p className="text-xs text-center text-gray-500 mt-2">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default PayPalButton;
