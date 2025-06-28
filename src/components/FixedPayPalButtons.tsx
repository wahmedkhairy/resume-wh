
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
  const [buttonsRendered, setButtonsRendered] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get selected plan data
  const selectedPlan = plans.find(plan => plan.name === selectedTier) || plans[0];

  // Load PayPal SDK script once
  useEffect(() => {
    const loadPayPalScript = () => {
      console.log('Checking PayPal SDK...');
      
      // Check if PayPal is already available
      if ((window as any).paypal) {
        console.log('PayPal SDK already available');
        setScriptLoaded(true);
        return;
      }

      // Check if script is already loading
      const existingScript = document.getElementById('paypal-js-sdk');
      if (existingScript) {
        console.log('PayPal script already exists, waiting for load...');
        existingScript.addEventListener('load', () => {
          console.log('Existing PayPal SDK loaded');
          setScriptLoaded(true);
        });
        return;
      }

      // Create new script
      console.log('Loading new PayPal SDK...');
      const script = document.createElement('script');
      script.id = 'paypal-js-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2&currency=USD`;
      
      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        setScriptLoaded(true);
        setError(null);
      };
      
      script.onerror = (error) => {
        console.error('PayPal SDK failed to load:', error);
        setError('Failed to load PayPal. Please refresh the page.');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadPayPalScript();
  }, []); // Only run once

  // Render PayPal Buttons when script is loaded
  useEffect(() => {
    if (!scriptLoaded || !paypalRef.current || buttonsRendered) {
      return;
    }

    const renderButtons = async () => {
      try {
        console.log('Rendering PayPal buttons for plan:', selectedPlan.name);
        setIsLoading(true);
        
        // Ensure PayPal is available
        if (!(window as any).paypal) {
          throw new Error('PayPal SDK not available');
        }
        
        // Clear any existing content
        if (paypalRef.current) {
          paypalRef.current.innerHTML = '';
        }
        
        const amount = selectedPlan.priceUSD.toFixed(2);
        console.log('Creating PayPal order with amount:', amount);
        
        await (window as any).paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('PayPal createOrder called with amount:', amount);
            return actions.order.create({
              purchase_units: [{
                description: `${selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)} Plan`,
                amount: { 
                  currency_code: 'USD', 
                  value: amount 
                }
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            console.log('PayPal payment approved, capturing...');
            return actions.order.capture().then((details: any) => {
              console.log('PayPal payment captured successfully:', details);
              onSuccess({
                id: details.id,
                status: details.status,
                amount: amount,
                currency: 'USD',
                tier: selectedTier,
                payer_name: details.payer?.name?.given_name || 'Customer',
                payment_method: 'paypal'
              });
            });
          },
          onError: (err: any) => {
            console.error('PayPal payment error:', err);
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
            height: 45,
            label: 'paypal'
          }
        }).render(paypalRef.current);
        
        console.log('PayPal buttons rendered successfully');
        setButtonsRendered(true);
        setIsLoading(false);
        setError(null);
        
      } catch (renderError) {
        console.error('Error rendering PayPal buttons:', renderError);
        setError(`Failed to render PayPal buttons: ${renderError.message}`);
        setIsLoading(false);
      }
    };

    renderButtons();
  }, [scriptLoaded, selectedPlan.name, selectedPlan.priceUSD, selectedTier, onSuccess, onError, onCancel, buttonsRendered]);

  // Reset buttons when tier changes
  useEffect(() => {
    setButtonsRendered(false);
    setIsLoading(true);
  }, [selectedTier]);

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
