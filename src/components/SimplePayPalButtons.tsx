
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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const initializePayPal = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Wait for container to be available
        const waitForContainer = () => {
          return new Promise<HTMLDivElement>((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            const checkContainer = () => {
              if (!mountedRef.current) {
                reject(new Error('Component unmounted'));
                return;
              }
              
              const container = paypalRef.current;
              if (container) {
                console.log('PayPal container found:', container);
                resolve(container);
                return;
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                reject(new Error('PayPal container not found after waiting'));
                return;
              }
              
              setTimeout(checkContainer, 100);
            };
            
            checkContainer();
          });
        };

        // Wait for container
        const container = await waitForContainer();
        
        if (!mountedRef.current) return;

        // Remove existing PayPal script
        const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Load PayPal SDK
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E&currency=USD`;
          script.async = true;

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

        if (!mountedRef.current) return;

        // Initialize PayPal buttons
        if (!window.paypal) {
          throw new Error('PayPal SDK not available');
        }

        // Double-check container is still available
        if (!paypalRef.current) {
          throw new Error('PayPal container lost after SDK load');
        }

        // Clear container
        paypalRef.current.innerHTML = '';

        console.log('Initializing PayPal buttons...');

        await window.paypal.Buttons({
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
              if (mountedRef.current) {
                onSuccess({
                  id: details.id,
                  status: details.status,
                  amount: amount,
                  currency: 'USD',
                  tier: tier,
                  payer_name: details.payer?.name?.given_name || 'Customer',
                  payment_method: 'paypal'
                });
              }
            });
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            if (mountedRef.current) {
              onError(err);
            }
          },
          onCancel: () => {
            console.log('PayPal payment cancelled');
            if (mountedRef.current) {
              onCancel();
            }
          },
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          }
        }).render(paypalRef.current);

        console.log('PayPal buttons rendered successfully');
        if (mountedRef.current) {
          setIsLoading(false);
        }

      } catch (error: any) {
        console.error('PayPal initialization error:', error);
        if (mountedRef.current) {
          setError(error.message || 'Failed to initialize PayPal');
          setIsLoading(false);
        }
      }
    };

    // Start initialization after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializePayPal, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
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
      
      <div 
        ref={paypalRef} 
        className="w-full min-h-[60px]"
        style={{ minHeight: '60px' }}
      />
      
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default SimplePayPalButtons;
