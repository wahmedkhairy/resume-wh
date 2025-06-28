
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window { 
    paypal: any; 
  }
}

interface DynamicPayPalButtonsProps {
  selectedTier: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const DynamicPayPalButtons: React.FC<DynamicPayPalButtonsProps> = ({
  selectedTier,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [prices, setPrices] = useState({
    basic: '2.00',
    premium: '3.00',
    unlimited: '4.99'
  });
  const { toast } = useToast();

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        console.log('Fetching user location for PayPal pricing...');
        
        // Fetch user location
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        console.log('Location data:', data);
        
        const country = data.country || data.country_name || '';
        const isEgypt = country === 'EG' || country === 'Egypt';
        
        // Set currency and prices based on location
        const detectedCurrency = isEgypt ? 'EGP' : 'USD';
        const detectedPrices = {
          basic: isEgypt ? '99.00' : '2.00',
          premium: isEgypt ? '149.00' : '3.00',
          unlimited: isEgypt ? '249.00' : '4.99',
        };

        setCurrency(detectedCurrency);
        setPrices(detectedPrices);
        
        console.log('Currency set to:', detectedCurrency);
        console.log('Prices set to:', detectedPrices);

        // Remove any existing PayPal scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
        existingScripts.forEach(script => script.remove());

        // Load PayPal SDK with client-id and currency
        console.log('Loading PayPal SDK...');
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2&currency=${detectedCurrency}`;
        script.async = true;
        
        script.onload = () => {
          console.log('PayPal SDK loaded successfully');
          renderPayPalButton();
        };
        
        script.onerror = (error) => {
          console.error('Failed to load PayPal SDK:', error);
          setError('Failed to load PayPal. Please refresh the page.');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);

      } catch (err) {
        console.error('Location fetch error:', err);
        // Fallback to USD if location fetch fails
        setCurrency('USD');
        setPrices({
          basic: '2.00',
          premium: '3.00',
          unlimited: '4.99'
        });
        loadPayPalWithFallback();
      }
    };

    const loadPayPalWithFallback = () => {
      console.log('Loading PayPal with USD fallback...');
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal SDK loaded with fallback');
        renderPayPalButton();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load PayPal SDK with fallback:', error);
        setError('Failed to load PayPal. Please refresh the page.');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };

    const renderPayPalButton = () => {
      console.log('Rendering PayPal button for tier:', selectedTier);
      
      const containerId = `paypal-button-container-${selectedTier}`;
      const container = document.getElementById(containerId);
      
      if (!container) {
        console.error('PayPal container not found:', containerId);
        setError('PayPal container not found. Please refresh the page.');
        setIsLoading(false);
        return;
      }

      // Clear existing content
      container.innerHTML = '';

      try {
        window.paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('Creating PayPal order for', selectedTier, 'plan');
            const price = prices[selectedTier as keyof typeof prices];
            return actions.order.create({
              purchase_units: [{
                amount: { 
                  currency_code: currency, 
                  value: price 
                },
                description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan Subscription`
              }]
            });
          },
          onApprove: (data: any, actions: any) => {
            console.log('Payment approved, capturing order...');
            return actions.order.capture().then((details: any) => {
              console.log('Payment successful:', details);
              const price = prices[selectedTier as keyof typeof prices];
              onSuccess({
                id: details.id,
                status: details.status,
                amount: price,
                currency: currency,
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
        }).render(`#${containerId}`);

        console.log('PayPal button rendered successfully');
        setIsLoading(false);
        
      } catch (renderError) {
        console.error('Error rendering PayPal button:', renderError);
        setError('Failed to render PayPal button. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializePayPal();

    return () => {
      // Cleanup
      const script = document.querySelector('script[src*="paypal.com"]');
      if (script) {
        script.remove();
      }
    };
  }, [selectedTier, onSuccess, onError, onCancel]);

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
      <div 
        id={`paypal-button-container-${selectedTier}`} 
        className="w-full min-h-[60px]"
      />
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal • {currency} {prices[selectedTier as keyof typeof prices]}
      </p>
    </div>
  );
};

export default DynamicPayPalButtons;
