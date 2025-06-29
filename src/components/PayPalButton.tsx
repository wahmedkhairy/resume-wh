
import React, { useEffect, useRef, useState } from 'react';
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
  const { toast } = useToast();

  useEffect(() => {
    const initPayPal = async () => {
      try {
        console.log('Initializing PayPal button...');
        
        // Remove existing script if present
        const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E&currency=USD`;
        script.async = true;

        script.onload = () => {
          console.log('PayPal SDK loaded successfully');
          renderButtons();
        };

        script.onerror = () => {
          console.error('Failed to load PayPal SDK');
          setIsLoading(false);
          toast({
            title: "PayPal Error",
            description: "Failed to initialize PayPal. Please check your configuration.",
            variant: "destructive"
          });
        };

        document.head.appendChild(script);
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

    const renderButtons = () => {
      if (!window.paypal || !containerRef.current) {
        console.error('PayPal SDK or container not available');
        setIsLoading(false);
        return;
      }

      // Clear any existing content
      containerRef.current.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          console.log('Creating PayPal order...');
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: amount
              },
              description: `Payment for $${amount}`
            }]
          });
        },
        
        onApprove: (data: any, actions: any) => {
          console.log('PayPal payment approved:', data.orderID);
          return actions.order.capture().then((details: any) => {
            console.log('Payment captured:', details);
            
            toast({
              title: "Payment Successful!",
              description: `Payment of $${amount} completed successfully.`,
            });

            if (onSuccess) {
              onSuccess(details);
            }
          });
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
      }).render(containerRef.current).then(() => {
        setIsLoading(false);
        console.log('PayPal buttons rendered successfully');
      }).catch((err: any) => {
        console.error('Error rendering PayPal buttons:', err);
        setIsLoading(false);
        toast({
          title: "PayPal Error",
          description: "Failed to render PayPal buttons. Please try again.",
          variant: "destructive"
        });
      });
    };

    initPayPal();
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
