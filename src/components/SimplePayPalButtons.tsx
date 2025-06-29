
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface to include paypal
declare global {
  interface Window {
    paypal?: any;
  }
}

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
  const [sdkReady, setSdkReady] = useState(false);
  const initializationAttempted = useRef(false);
  const mountedRef = useRef(true);
  const { toast } = useToast();

  // Check if PayPal SDK is already loaded
  const checkPayPalSDK = useCallback(() => {
    return typeof window !== 'undefined' && window.paypal && typeof window.paypal.Buttons === 'function';
  }, []);

  // Initialize PayPal buttons with better error handling and stability
  const initializePayPalButtons = useCallback(() => {
    console.log('Attempting to initialize PayPal buttons...');
    
    // Check if component is still mounted
    if (!mountedRef.current) {
      console.log('Component unmounted, skipping initialization');
      return;
    }

    // Prevent multiple initialization attempts
    if (initializationAttempted.current) {
      console.log('Initialization already attempted, skipping...');
      return;
    }

    if (!checkPayPalSDK()) {
      console.error('PayPal SDK not ready');
      setError('PayPal SDK not available');
      setIsLoading(false);
      return;
    }

    if (!paypalRef.current) {
      console.error('PayPal container ref is null');
      setError('PayPal container not found');
      setIsLoading(false);
      return;
    }

    // Verify container is in DOM and visible
    const container = paypalRef.current;
    const rect = container.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && document.contains(container);
    
    if (!isVisible) {
      console.error('PayPal container is not visible or not in DOM');
      console.log('Container dimensions:', rect);
      console.log('Container in DOM:', document.contains(container));
      setError('PayPal container not visible');
      setIsLoading(false);
      return;
    }

    initializationAttempted.current = true;

    try {
      // Clear any existing content
      container.innerHTML = '';

      console.log('Creating PayPal buttons...');
      
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
      }).render(container)
        .then(() => {
          console.log('PayPal buttons rendered successfully');
          if (mountedRef.current) {
            setIsLoading(false);
            setError(null);
          }
        })
        .catch((err: any) => {
          console.error('Error rendering PayPal buttons:', err);
          if (mountedRef.current) {
            setError('Failed to render PayPal buttons');
            setIsLoading(false);
            initializationAttempted.current = false; // Reset for retry
          }
        });

    } catch (err) {
      console.error('Error in PayPal button initialization:', err);
      if (mountedRef.current) {
        setError('Error initializing PayPal buttons');
        setIsLoading(false);
        initializationAttempted.current = false; // Reset for retry
      }
    }
  }, [amount, tier, onSuccess, onError, onCancel, checkPayPalSDK]);

  // Load PayPal SDK
  const loadPayPalSDK = useCallback(() => {
    console.log('Loading PayPal SDK...');
    
    // Check if SDK is already loaded
    if (checkPayPalSDK()) {
      console.log('PayPal SDK already loaded');
      setSdkReady(true);
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // Remove existing script if any
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E&currency=USD`;
      script.async = true;

      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        if (mountedRef.current) {
          setSdkReady(true);
          resolve();
        }
      };

      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        reject(new Error('Failed to load PayPal SDK'));
      };

      document.head.appendChild(script);
    });
  }, [checkPayPalSDK]);

  // Component mount effect
  useEffect(() => {
    mountedRef.current = true;
    console.log('PayPal component mounted');

    return () => {
      console.log('PayPal component cleanup');
      mountedRef.current = false;
      initializationAttempted.current = false;
    };
  }, []);

  // Main effect to load SDK and initialize buttons
  useEffect(() => {
    console.log('Main effect triggered');
    
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    initializationAttempted.current = false;

    loadPayPalSDK()
      .then(() => {
        console.log('SDK loaded, waiting for DOM...');
        // Give more time for DOM to be fully ready
        setTimeout(() => {
          if (mountedRef.current && paypalRef.current) {
            initializePayPalButtons();
          } else {
            console.error('PayPal ref still null after timeout');
            if (mountedRef.current) {
              setError('Unable to initialize PayPal - please try refreshing the page');
              setIsLoading(false);
            }
          }
        }, 1000); // Increased timeout for stability
      })
      .catch((err) => {
        console.error('Failed to load PayPal SDK:', err);
        if (mountedRef.current) {
          setError('Failed to load PayPal. Please check your connection and refresh.');
          setIsLoading(false);
        }
      });
  }, [loadPayPalSDK, initializePayPalButtons]);

  // Effect to initialize buttons when SDK becomes ready
  useEffect(() => {
    if (sdkReady && paypalRef.current && !initializationAttempted.current && mountedRef.current) {
      console.log('SDK ready and ref available, initializing...');
      setTimeout(() => {
        if (mountedRef.current) {
          initializePayPalButtons();
        }
      }, 200);
    }
  }, [sdkReady, initializePayPalButtons]);

  const handleRetry = () => {
    console.log('Retry button clicked');
    if (!mountedRef.current) return;
    
    setError(null);
    setIsLoading(true);
    setSdkReady(false);
    initializationAttempted.current = false;
    
    // Force reload of the component logic
    loadPayPalSDK()
      .then(() => {
        setTimeout(() => {
          if (mountedRef.current) {
            initializePayPalButtons();
          }
        }, 500);
      })
      .catch(() => {
        if (mountedRef.current) {
          setError('Failed to reload PayPal. Please refresh the page.');
          setIsLoading(false);
        }
      });
  };

  if (error) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <div className="space-x-2">
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
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
      
      {/* Removed the key prop that was forcing remounts */}
      <div 
        ref={paypalRef}
        className="w-full min-h-[60px]" 
        style={{ minHeight: '60px', display: 'block' }}
      />
      
      <p className="text-xs text-center text-gray-500 mt-3">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default SimplePayPalButtons;
