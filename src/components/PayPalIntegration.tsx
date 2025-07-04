
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PayPalIntegrationProps {
  amount: string;
  tier: 'basic' | 'premium' | 'unlimited';
  onSuccess: (details: any) => void;
  onError: (err: any) => void;
  onCancel: () => void;
}

const PayPalIntegration: React.FC<PayPalIntegrationProps> = ({
  amount,
  tier,
  onSuccess,
  onError,
  onCancel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [clientId, setClientId] = useState<string>('');
  
  // Refs for cleanup and state management
  const mountedRef = useRef(true);
  const sdkLoadingRef = useRef(false);
  const buttonsRenderedRef = useRef(false);
  const currentPropsRef = useRef({ amount, tier });
  
  const MAX_RETRIES = 3;
  const SDK_TIMEOUT = 15000;

  // Debug logging (only in development)
  const debug = useCallback((message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logMethod(`[PayPal] ${message}`);
    }
  }, []);

  // Complete cleanup function
  const cleanup = useCallback(() => {
    debug('Cleaning up PayPal resources');
    
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Remove PayPal scripts
    document.querySelectorAll('script[src*="paypal.com/sdk"]').forEach(script => script.remove());
    
    // Reset state
    buttonsRenderedRef.current = false;
    sdkLoadingRef.current = false;
    
    // Clean window object
    if (window.paypal) {
      try {
        delete window.paypal;
      } catch (e) {
        debug('Could not delete paypal from window', 'warn');
      }
    }
  }, [debug]);

  // Fetch PayPal configuration
  const fetchConfig = useCallback(async () => {
    try {
      debug('Fetching PayPal configuration');
      const { data, error } = await supabase.functions.invoke('get-paypal-config');
      
      if (error) throw new Error(`Config fetch failed: ${error.message}`);
      if (!data?.clientId) throw new Error('PayPal Client ID not configured');
      
      debug('PayPal Client ID fetched successfully');
      return data.clientId;
    } catch (err) {
      debug(`Config fetch error: ${err}`, 'error');
      throw err;
    }
  }, [debug]);

  // Load PayPal SDK
  const loadSDK = useCallback(async () => {
    if (sdkLoadingRef.current || !mountedRef.current) return;

    try {
      sdkLoadingRef.current = true;
      debug('Loading PayPal SDK');
      
      // Check if already loaded
      if (window.paypal?.Buttons) {
        debug('PayPal SDK already loaded');
        setSdkLoaded(true);
        setLoading(false);
        return;
      }

      // Get client ID
      const fetchedClientId = await fetchConfig();
      if (!mountedRef.current) return;
      
      setClientId(fetchedClientId);
      cleanup();

      // Load SDK script
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${fetchedClientId}&currency=USD&intent=capture&components=buttons`;
        script.async = true;
        
        const timeout = setTimeout(() => {
          script.remove();
          reject(new Error('SDK loading timeout'));
        }, SDK_TIMEOUT);
        
        script.onload = () => {
          clearTimeout(timeout);
          debug('PayPal SDK loaded');
          
          // Wait for PayPal to initialize
          const checkReady = (attempts = 0) => {
            if (attempts > 50) {
              reject(new Error('PayPal initialization timeout'));
              return;
            }
            
            if (window.paypal?.Buttons) {
              debug('PayPal SDK ready');
              setSdkLoaded(true);
              setLoading(false);
              resolve();
            } else {
              setTimeout(() => checkReady(attempts + 1), 100);
            }
          };
          
          checkReady();
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          script.remove();
          reject(new Error('SDK loading failed'));
        };
        
        document.head.appendChild(script);
      });
        
    } catch (err) {
      debug(`SDK loading error: ${err}`, 'error');
      if (mountedRef.current) {
        setError('Unable to load payment system. Please try again.');
        setLoading(false);
        onError(err);
      }
    } finally {
      sdkLoadingRef.current = false;
    }
  }, [fetchConfig, cleanup, debug, onError]);

  // Render PayPal buttons
  const renderButtons = useCallback(() => {
    if (!window.paypal?.Buttons || !containerRef.current || buttonsRenderedRef.current) {
      debug('Cannot render buttons - SDK not ready or already rendered');
      return;
    }

    debug('Rendering PayPal buttons');
    
    try {
      containerRef.current.innerHTML = '';
      
      const buttonsConfig = {
        style: { 
          layout: 'vertical' as const,
          color: 'gold' as const,
          shape: 'rect' as const,
          label: 'pay' as const,
          height: 45,
          tagline: false
        },
        
        createOrder: async (data: any, actions: any) => {
          debug('Creating order');
          try {
            const { data: orderData, error } = await supabase.functions.invoke('create-paypal-order', {
              body: {
                amount,
                currency: 'USD',
                description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount} USD`,
                tier
              }
            });

            if (error) throw new Error('Order creation failed');
            if (!orderData?.orderId) throw new Error('No order ID received');

            debug(`Order created: ${orderData.orderId}`);
            return orderData.orderId;
          } catch (err) {
            debug(`Order creation error: ${err}`, 'error');
            onError(err);
            throw err;
          }
        },
        
        onApprove: async (data: any, actions: any) => {
          debug('Payment approved, capturing');
          try {
            const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
              body: { orderId: data.orderID }
            });

            if (error) throw new Error('Payment capture failed');
            
            debug('Payment captured successfully');
            onSuccess(captureData);
          } catch (err) {
            debug(`Payment capture error: ${err}`, 'error');
            onError(err);
          }
        },
        
        onError: (err: any) => {
          debug(`PayPal error: ${err}`, 'error');
          setError('Payment processing error. Please try again.');
          onError(err);
        },
        
        onCancel: () => {
          debug('Payment cancelled');
          onCancel();
        }
      };

      window.paypal.Buttons(buttonsConfig).render(containerRef.current)
        .then(() => {
          debug('Buttons rendered successfully');
          buttonsRenderedRef.current = true;
        })
        .catch((err: any) => {
          debug(`Button rendering error: ${err}`, 'error');
          setError('Unable to display payment options. Please try again.');
          onError(err);
        });

    } catch (err) {
      debug(`Button setup error: ${err}`, 'error');
      setError('Payment system error. Please try again.');
      onError(err);
    }
  }, [amount, tier, onSuccess, onError, onCancel, debug]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    debug(`Retrying (${retryCount + 1}/${MAX_RETRIES})`);
    
    cleanup();
    setError(null);
    setLoading(true);
    setSdkLoaded(false);
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      if (mountedRef.current) {
        loadSDK();
      }
    }, 1000);
  }, [retryCount, cleanup, loadSDK, debug]);

  // Force refresh buttons
  const refreshButtons = useCallback(() => {
    if (sdkLoaded && containerRef.current && !loading && !error) {
      debug('Force refreshing buttons');
      containerRef.current.innerHTML = '';
      buttonsRenderedRef.current = false;
      
      setTimeout(() => {
        if (mountedRef.current) {
          renderButtons();
        }
      }, 100);
    }
  }, [sdkLoaded, loading, error, renderButtons, debug]);

  // Handle prop changes (plan selection)
  useEffect(() => {
    const prevProps = currentPropsRef.current;
    if (amount !== prevProps.amount || tier !== prevProps.tier) {
      debug(`Props changed: ${prevProps.tier}($${prevProps.amount}) -> ${tier}($${amount})`);
      
      // Clear existing buttons
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      buttonsRenderedRef.current = false;
      setError(null);
      
      // Re-render if SDK is ready
      if (sdkLoaded && !loading) {
        setTimeout(() => {
          if (mountedRef.current) {
            renderButtons();
          }
        }, 100);
      }
      
      currentPropsRef.current = { amount, tier };
    }
  }, [amount, tier, sdkLoaded, loading, renderButtons, debug]);

  // Initialize SDK
  useEffect(() => {
    mountedRef.current = true;
    debug('Component mounted');
    
    if (!sdkLoaded && !sdkLoadingRef.current) {
      loadSDK();
    }

    return () => {
      mountedRef.current = false;
      debug('Component unmounted');
    };
  }, [loadSDK, sdkLoaded, debug]);

  // Render buttons when ready
  useEffect(() => {
    if (sdkLoaded && 
        containerRef.current && 
        !loading && 
        !error && 
        clientId && 
        mountedRef.current && 
        !buttonsRenderedRef.current) {
      
      debug('All conditions met, rendering buttons');
      setTimeout(() => {
        if (mountedRef.current && !buttonsRenderedRef.current) {
          renderButtons();
        }
      }, 200);
    }
  }, [sdkLoaded, loading, error, clientId, renderButtons, debug]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 mb-2">Loading secure payment...</p>
          <p className="text-xs text-gray-500">Please wait while we prepare your payment options</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          
          {retryCount < MAX_RETRIES && (
            <button 
              onClick={handleRetry}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount}/${MAX_RETRIES})` : ''}`}
            </button>
          )}
          
          {retryCount >= MAX_RETRIES && (
            <p className="text-xs text-gray-500">
              Please refresh the page or contact support if the problem persists.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Payment interface
  return (
    <div className="payment-container">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Secure payment powered by PayPal
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan - ${amount} USD
        </p>
      </div>
      
      <div 
        ref={containerRef} 
        id="paypal-button-container"
        className="min-h-[50px] w-full"
      />
      
      {/* Refresh button for troubleshooting */}
      {sdkLoaded && !loading && !error && clientId && (
        <div className="text-center mt-4">
          <button
            onClick={refreshButtons}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Payment options not showing? Click to refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default PayPalIntegration;