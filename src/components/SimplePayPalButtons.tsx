
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
        // Clean up any existing PayPal scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
        existingScripts.forEach(script => script.remove());

        // Use sandbox client ID for now
        const clientId = "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
        
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
        script.async = true;
        
        script.onload = () => {
          if (paypalRef.current && (window as any).paypal) {
            (window as any).paypal.Buttons({
              createOrder: (data: any, actions: any) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: amount,
                      currency_code: currency
                    },
                    description: `${tier} Plan - Resume Builder`
                  }]
                });
              },
              onApprove: async (data: any, actions: any) => {
                try {
                  const details = await actions.order.capture();
                  onSuccess({
                    id: details.id,
                    status: details.status,
                    amount: amount,
                    currency: currency,
                    tier: tier,
                    payment_method: 'paypal'
                  });
                } catch (error) {
                  console.error('PayPal capture error:', error);
                  onError(error);
                }
              },
              onError: (err: any) => {
                console.error('PayPal error:', err);
                onError(err);
              },
              onCancel: () => {
                onCancel();
              },
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                height: 45
              }
            }).render(paypalRef.current);
            setIsLoading(false);
          }
        };

        script.onerror = () => {
          setError('Failed to load PayPal');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('PayPal initialization error:', error);
        setError('Failed to initialize PayPal');
        setIsLoading(false);
      }
    };

    initializePayPal();
  }, [amount, currency, tier, onSuccess, onError, onCancel]);

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm">Loading PayPal...</span>
      </div>
    );
  }

  return <div ref={paypalRef} className="w-full" />;
};

export default SimplePayPalButtons;
