
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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        console.log('Starting PayPal initialization...');
        setIsLoading(true);
        setError(null);

        // Clean up any existing PayPal scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal.com"]');
        existingScripts.forEach(script => script.remove());

        // Clear any existing PayPal global objects
        if ((window as any).paypal) {
          delete (window as any).paypal;
        }

        // Use sandbox client ID for now
        const clientId = "ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2";
        
        console.log('Loading PayPal SDK with currency:', currency);
        
        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons`;
        script.async = true;
        script.id = 'paypal-sdk-script';
        
        const loadPromise = new Promise<void>((resolve, reject) => {
          script.onload = () => {
            console.log('PayPal SDK loaded successfully');
            setIsScriptLoaded(true);
            resolve();
          };

          script.onerror = () => {
            console.error('Failed to load PayPal SDK');
            reject(new Error('Failed to load PayPal SDK'));
          };
        });

        document.head.appendChild(script);
        await loadPromise;

        // Wait a bit for PayPal to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!paypalRef.current) {
          throw new Error('PayPal container not found');
        }

        if (!(window as any).paypal) {
          throw new Error('PayPal SDK not available');
        }

        console.log('Rendering PayPal buttons...');

        // Clear any existing content in the container
        paypalRef.current.innerHTML = '';

        await (window as any).paypal.Buttons({
          createOrder: (data: any, actions: any) => {
            console.log('Creating PayPal order...');
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
              console.log('PayPal payment approved, capturing...');
              const details = await actions.order.capture();
              console.log('Payment captured successfully:', details);
              
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
            console.log('PayPal payment cancelled');
            onCancel();
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            height: 45,
            tagline: false
          }
        }).render(paypalRef.current).then(() => {
          console.log('PayPal buttons rendered successfully');
          setIsLoading(false);
        }).catch((renderError: any) => {
          console.error('Error rendering PayPal buttons:', renderError);
          throw renderError;
        });

      } catch (error) {
        console.error('PayPal initialization error:', error);
        setError('Failed to initialize PayPal. Please refresh and try again.');
        setIsLoading(false);
        toast({
          title: "PayPal Error",
          description: "Failed to load PayPal. Please refresh the page and try again.",
          variant: "destructive"
        });
      }
    };

    initializePayPal();

    // Cleanup function
    return () => {
      const script = document.getElementById('paypal-sdk-script');
      if (script) {
        script.remove();
      }
    };
  }, [amount, currency, tier, onSuccess, onError, onCancel, toast]);

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-sm mb-2">{error}</p>
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
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
        <span className="text-sm">
          {isScriptLoaded ? 'Initializing PayPal buttons...' : 'Loading PayPal...'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={paypalRef} className="w-full min-h-[50px]" />
      <p className="text-xs text-center text-muted-foreground mt-2">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default SimplePayPalButtons;
