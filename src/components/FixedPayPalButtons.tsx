
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  name: string;
  priceUSD: number;
}

const plans: Plan[] = [
  { name: 'basic', priceUSD: 2.00 },
  { name: 'premium', priceUSD: 3.00 },
  { name: 'unlimited', priceUSD: 4.99 }
];

interface FixedPayPalButtonsProps {
  selectedTier: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const FixedPayPalButtons: React.FC<FixedPayPalButtonsProps> = ({
  selectedTier,
  onSuccess,
  onError,
  onCancel
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get selected plan data
  const selectedPlan = plans.find(plan => plan.name === selectedTier) || plans[0];

  useEffect(() => {
    console.log('Loading PayPal SDK...');
    // Load PayPal JS SDK script once
    const existingScript = document.getElementById('paypal-js-sdk');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'paypal-js-sdk';
      // Always use USD for PayPal
      script.src = `https://www.paypal.com/sdk/js?client-id=ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2&currency=USD`;
      script.addEventListener('load', () => {
        console.log('PayPal SDK loaded successfully');
        setScriptLoaded(true);
      });
      script.addEventListener('error', (error) => {
        console.error('PayPal SDK failed to load:', error);
        setError('Failed to load PayPal. Please refresh the page.');
        setIsLoading(false);
      });
      document.body.appendChild(script);
    } else {
      console.log('PayPal SDK already exists, marking as loaded');
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    console.log('Rendering PayPal buttons...', { scriptLoaded, selectedTier });
    // Render PayPal Buttons after script loads or when plan changes
    if (scriptLoaded && paypalRef.current && (window as any).paypal) {
      setIsLoading(true);
      
      // Clear any existing buttons
      paypalRef.current.innerHTML = '';
      
      try {
        (window as any).paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('Creating PayPal order for plan:', selectedPlan.name);
            const amount = selectedPlan.priceUSD.toFixed(2);
            return actions.order.create({
              purchase_units: [{
                description: `${selectedPlan.name} plan`,
                amount: { currency_code: 'USD', value: amount }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            console.log('Payment approved, capturing order...');
            return actions.order.capture().then((details: any) => {
              console.log('Payment successful:', details);
              onSuccess({
                id: details.id,
                status: details.status,
                amount: selectedPlan.priceUSD.toFixed(2),
                currency: 'USD',
                tier: selectedTier,
                payer_name: details.payer?.name?.given_name || 'Customer',
                payment_method: 'paypal'
              });
            });
          },
          onError: (err: any) => {
            console.error('PayPal Buttons error:', err);
            onError(err);
          },
          onCancel: () => {
            console.log('Payment cancelled by user');
            onCancel();
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            height: 45,
            label: 'paypal'
          }
        }).render(paypalRef.current).then(() => {
          console.log('PayPal buttons rendered successfully');
          setIsLoading(false);
          setError(null);
        }).catch((renderError: any) => {
          console.error('Error rendering PayPal buttons:', renderError);
          setError('Failed to render PayPal buttons. Please refresh the page.');
          setIsLoading(false);
        });
      } catch (error) {
        console.error('PayPal buttons creation error:', error);
        setError('Failed to create PayPal buttons. Please refresh the page.');
        setIsLoading(false);
      }
    }
  }, [scriptLoaded, selectedTier, selectedPlan, onSuccess, onError, onCancel]);

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
      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
        <p className="text-sm font-medium">
          {selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)} Plan - ${selectedPlan.priceUSD.toFixed(2)} USD
        </p>
      </div>
      
      <div ref={paypalRef} className="w-full min-h-[60px]" />
      
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default FixedPayPalButtons;
