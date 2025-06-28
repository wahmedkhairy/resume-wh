
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SimplePayPalButtonsProps {
  amount: string;
  currency: string;
  tier: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const SimplePayPalButtons: React.FC<SimplePayPalButtonsProps> = ({
  amount,
  currency,
  tier,
  onSuccess,
  onError,
  onCancel
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        console.log('Initializing PayPal for currency:', currency);
        setIsLoading(true);
        setError(null);

        // Use sandbox client ID
        const clientId = "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
        
        // Check if PayPal script already exists and is loaded
        const existingScript = document.querySelector('#paypal-sdk');
        if (existingScript && (window as any).paypal) {
          console.log('PayPal SDK already loaded, rendering buttons...');
          await renderPayPalButtons();
          return;
        }

        // Remove any existing PayPal scripts
        document.querySelectorAll('script[src*="paypal.com"]').forEach(script => script.remove());

        // Load PayPal SDK
        console.log('Loading PayPal SDK...');
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons`;
        script.async = true;
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('PayPal SDK loaded successfully');
            resolve();
          };
          script.onerror = () => {
            console.error('Failed to load PayPal SDK');
            reject(new Error('Failed to load PayPal SDK'));
          };
          document.head.appendChild(script);
        });

        // Wait for PayPal to be available
        let attempts = 0;
        while (!(window as any).paypal && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!(window as any).paypal) {
          throw new Error('PayPal SDK not available after loading');
        }

        await renderPayPalButtons();

      } catch (error) {
        console.error('PayPal initialization error:', error);
        setError('Unable to load PayPal. Please try refreshing the page.');
        setIsLoading(false);
      }
    };

    const renderPayPalButtons = async () => {
      if (!paypalRef.current) {
        throw new Error('PayPal container not found');
      }

      console.log('Rendering PayPal buttons...');
      paypalRef.current.innerHTML = '';

      try {
        await (window as any).paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount,
                  currency_code: currency
                },
                description: `${tier} Plan Subscription`
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              console.log('Payment successful:', details);
              onSuccess({
                id: details.id,
                status: details.status,
                amount: amount,
                currency: currency,
                tier: tier,
                payment_method: 'paypal'
              });
            } catch (error) {
              console.error('Payment capture error:', error);
              onError(error);
            }
          },
          onError: (err: any) => {
            console.error('PayPal button error:', err);
            onError(err);
          },
          onCancel: () => {
            console.log('Payment cancelled');
            onCancel();
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            height: 45
          }
        }).render(paypalRef.current);

        console.log('PayPal buttons rendered successfully');
        setIsLoading(false);
      } catch (renderError) {
        console.error('Button render error:', renderError);
        throw renderError;
      }
    };

    initializePayPal();

    return () => {
      // Cleanup on unmount
      const script = document.querySelector('#paypal-sdk');
      if (script) {
        script.remove();
      }
    };
  }, [amount, currency, tier, onSuccess, onError, onCancel]);

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-sm text-gray-600">Loading PayPal payment options...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={paypalRef} className="w-full min-h-[60px]" />
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default SimplePayPalButtons;
