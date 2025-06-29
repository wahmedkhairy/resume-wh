
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PayPalIntegrationProps {
  amount: string;
  tier: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalIntegration: React.FC<PayPalIntegrationProps> = ({
  amount,
  tier,
  onSuccess,
  onError,
  onCancel
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const cleanupPayPal = useCallback(() => {
    if (paypalRef.current) {
      paypalRef.current.innerHTML = '';
    }
    setIsInitialized(false);
  }, []);

  const renderPayPalButton = useCallback(() => {
    if (!window.paypal || !paypalRef.current || isInitialized) {
      return;
    }

    console.log('Rendering PayPal button');
    
    try {
      // Clear any existing content
      paypalRef.current.innerHTML = '';
      
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 40
        },
        createOrder: (data: any, actions: any) => {
          console.log('Creating PayPal order');
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: amount
              },
              description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - $${amount}`
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          console.log('PayPal payment approved');
          try {
            const details = await actions.order.capture();
            console.log('Order captured:', details);
            
            const paymentDetails = {
              id: details.id,
              status: details.status,
              amount: amount,
              currency: 'USD',
              tier: tier,
              payer_name: details.payer?.name?.given_name || 'Customer',
              payment_method: 'paypal'
            };

            onSuccess(paymentDetails);
          } catch (error) {
            console.error('Error capturing PayPal order:', error);
            onError(error);
          }
        },
        onError: (err: any) => {
          console.error('PayPal button error:', err);
          setError('Payment failed. Please try again.');
          onError(err);
        },
        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data);
          onCancel();
        }
      }).render(paypalRef.current).then(() => {
        console.log('PayPal buttons rendered successfully');
        setIsLoading(false);
        setError(null);
        setIsInitialized(true);
      }).catch((renderError: any) => {
        console.error('PayPal render error:', renderError);
        setError('Failed to load PayPal. Please refresh the page.');
        setIsLoading(false);
      });
    } catch (initError) {
      console.error('PayPal initialization error:', initError);
      setError('Failed to initialize PayPal. Please refresh the page.');
      setIsLoading(false);
    }
  }, [amount, tier, onSuccess, onError, onCancel, isInitialized]);

  const loadPayPalScript = useCallback(() => {
    console.log('Loading PayPal script');
    
    // Check if PayPal is already loaded
    if (window.paypal) {
      console.log('PayPal already loaded');
      renderPayPalButton();
      return;
    }

    // Remove any existing PayPal scripts
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E&currency=USD';
    script.async = true;

    script.onload = () => {
      console.log('PayPal script loaded successfully');
      // Add a small delay to ensure PayPal is fully initialized
      setTimeout(() => {
        renderPayPalButton();
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load PayPal SDK');
      setError('Failed to load PayPal SDK. Please check your internet connection and try again.');
      setIsLoading(false);
      toast({
        title: "PayPal Error",
        description: "Failed to load PayPal. Please refresh the page.",
        variant: "destructive",
      });
    };

    document.head.appendChild(script);
  }, [renderPayPalButton, toast]);

  useEffect(() => {
    console.log('PayPal integration mounting');
    cleanupPayPal();
    setIsLoading(true);
    setError(null);
    
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      loadPayPalScript();
    }, 50);

    return () => {
      clearTimeout(timer);
      cleanupPayPal();
    };
  }, [loadPayPalScript, cleanupPayPal]);

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            cleanupPayPal();
            loadPayPalScript();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading PayPal...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
        <p className="text-sm font-medium">
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - ${amount} USD
        </p>
      </div>
      
      <div 
        ref={paypalRef}
        className="w-full min-h-[60px] paypal-button-container"
        style={{ minHeight: '60px' }}
      />
      
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default PayPalIntegration;
