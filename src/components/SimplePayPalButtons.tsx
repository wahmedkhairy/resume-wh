
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SimplePayPalButtonsProps {
  amount: string;
  tier: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const SimplePayPalButtons: React.FC<SimplePayPalButtonsProps> = ({
  amount,
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
    const loadPayPal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Remove existing PayPal script
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
          initializeButtons();
        };

        script.onerror = () => {
          console.error('Failed to load PayPal SDK');
          setError('Failed to load PayPal. Please refresh the page.');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading PayPal:', err);
        setError('Error loading PayPal. Please try again.');
        setIsLoading(false);
      }
    };

    const initializeButtons = () => {
      if (!window.paypal) {
        console.error('PayPal SDK not available');
        setError('PayPal SDK not available');
        setIsLoading(false);
        return;
      }

      if (!paypalRef.current) {
        console.error('PayPal container not found');
        setError('PayPal container not found');
        setIsLoading(false);
        return;
      }

      // Clear container
      paypalRef.current.innerHTML = '';

      try {
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('Creating PayPal order for amount:', amount);
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: 'USD',
                  value: amount
                },
                description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            console.log('PayPal payment approved');
            return actions.order.capture().then((details: any) => {
              console.log('Payment captured:', details);
              onSuccess({
                id: details.id,
                status: details.status,
                amount: amount,
                currency: 'USD',
                tier: tier,
                payer_name: details.payer?.name?.given_name || 'Customer',
                payment_method: 'paypal'
              });
            });
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            onError(err);
          },
          onCancel: () => {
            console.log('PayPal payment cancelled');
            onCancel();
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }
        }).render(paypalRef.current).then(() => {
          console.log('PayPal buttons rendered successfully');
          setIsLoading(false);
        }).catch((err: any) => {
          console.error('Error rendering PayPal buttons:', err);
          setError('Failed to render PayPal buttons');
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Error initializing PayPal buttons:', err);
        setError('Error initializing PayPal buttons');
        setIsLoading(false);
      }
    };

    loadPayPal();
  }, [amount, tier, onSuccess, onError, onCancel]);

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
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
        <span className="text-sm text-gray-600">Loading PayPal...</span>
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
      
      <div ref={paypalRef} className="w-full min-h-[60px]" />
      
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default SimplePayPalButtons;
