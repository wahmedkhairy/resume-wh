
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PayPalIntegrationProps {
  amount: string;
  tier: 'basic' | 'premium' | 'unlimited';
  onSuccess: (details: any) => void;
  onError: (err: any) => void;
  onCancel: () => void;
}

interface DebugInfo {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
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
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Component state management
  const mountedRef = useRef(true);
  const sdkLoadingRef = useRef(false);
  const buttonsRenderedRef = useRef(false);
  const componentInstanceRef = useRef(Date.now()); // Unique instance ID
  
  // Track previous props to detect changes
  const prevPropsRef = useRef({ amount, tier });

  // Environment detection - only show debug in development
  const isDevelopment = process.env.NODE_ENV === 'development';
  const MAX_RETRIES = 3;
  const SDK_TIMEOUT = 15000;

  // Enhanced debug logging that respects environment
  const addDebugInfo = useCallback((message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const debugEntry: DebugInfo = { timestamp, message, level };
    
    // Always log to console in development
    if (isDevelopment) {
      const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      logMethod(`[PayPal Integration] ${timestamp}: ${message}`);
    }
    
    // Only store debug info in development
    if (isDevelopment && mountedRef.current) {
      setDebugInfo(prev => [...prev.slice(-19), debugEntry]); // Keep last 20 entries
    }
  }, [isDevelopment]);

  // Reset component state completely
  const resetComponentState = useCallback(() => {
    addDebugInfo('Resetting component state');
    setError(null);
    setLoading(true);
    setSdkLoaded(false);
    setClientId('');
    setRetryCount(0);
    if (isDevelopment) {
      setDebugInfo([]);
    }
    buttonsRenderedRef.current = false;
    componentInstanceRef.current = Date.now();
  }, [addDebugInfo, isDevelopment]);

  // Cleanup PayPal resources more thoroughly
  const cleanupPayPalResources = useCallback(() => {
    addDebugInfo('Cleaning up PayPal resources');
    
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    // Remove existing scripts
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existingScripts.forEach(script => {
      addDebugInfo('Removing existing PayPal script');
      script.remove();
    });
    
    // Clean up window object
    if (window.paypal) {
      try {
        delete window.paypal;
      } catch (e) {
        addDebugInfo('Could not delete paypal from window object', 'warn');
      }
    }
    
    buttonsRenderedRef.current = false;
  }, [addDebugInfo]);

  // Fetch PayPal configuration with better error handling
  const fetchPayPalConfig = useCallback(async () => {
    try {
      addDebugInfo('Fetching PayPal configuration...');
      
      const { data, error } = await supabase.functions.invoke('get-paypal-config');
      
      if (error) {
        addDebugInfo(`Error fetching PayPal config: ${error.message}`, 'error');
        throw new Error(`Failed to fetch PayPal configuration: ${error.message}`);
      }
      
      if (!data?.clientId) {
        addDebugInfo('No client ID in response', 'error');
        throw new Error('PayPal Client ID not configured');
      }
      
      addDebugInfo('PayPal Client ID fetched successfully');
      if (mountedRef.current) {
        setClientId(data.clientId);
      }
      return data.clientId;
      
    } catch (err) {
      addDebugInfo(`Error in fetchPayPalConfig: ${err}`, 'error');
      if (mountedRef.current) {
        setError('Unable to load payment system. Please try again.');
        onError(err);
      }
      throw err;
    }
  }, [onError, addDebugInfo]);

  // Enhanced PayPal SDK loading with better state management
  const loadPayPalSDK = useCallback(async () => {
    if (sdkLoadingRef.current || !mountedRef.current) {
      addDebugInfo('SDK loading already in progress or component unmounted, skipping...');
      return;
    }

    try {
      sdkLoadingRef.current = true;
      addDebugInfo('Starting PayPal SDK load...');
      
      // Check if PayPal is already loaded and functional
      if (window.paypal && typeof window.paypal.Buttons === 'function') {
        addDebugInfo('PayPal SDK already loaded and functional');
        if (mountedRef.current) {
          setSdkLoaded(true);
          setLoading(false);
        }
        return;
      }

      // Fetch the client ID
      const fetchedClientId = await fetchPayPalConfig();
      
      if (!mountedRef.current) {
        addDebugInfo('Component unmounted during config fetch');
        return;
      }

      // Clean up any existing resources
      cleanupPayPalResources();

      addDebugInfo('Creating new PayPal SDK script...');
      
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = `paypal-sdk-${componentInstanceRef.current}`;
        script.src = `https://www.paypal.com/sdk/js?client-id=${fetchedClientId}&currency=USD&intent=capture&disable-funding=credit,card`;
        script.async = true;
        script.defer = true;
        
        addDebugInfo(`SDK URL: ${script.src}`);
        
        const timeout = setTimeout(() => {
          addDebugInfo('SDK loading timeout reached', 'error');
          script.remove();
          if (mountedRef.current) {
            setError('Payment system is taking too long to load. Please check your connection and try again.');
            setLoading(false);
          }
          reject(new Error('PayPal SDK loading timeout'));
        }, SDK_TIMEOUT);
        
        script.onload = () => {
          clearTimeout(timeout);
          addDebugInfo('PayPal SDK script loaded');
          
          // Wait for PayPal object to be fully initialized
          const checkPayPalReady = (attempts = 0) => {
            if (attempts > 50) { // 5 seconds max
              addDebugInfo('PayPal object initialization timeout', 'error');
              if (mountedRef.current) {
                setError('Payment system failed to initialize. Please try again.');
                setLoading(false);
              }
              reject(new Error('PayPal SDK loaded but not functional'));
              return;
            }
            
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
              addDebugInfo('PayPal SDK fully initialized');
              if (mountedRef.current) {
                setSdkLoaded(true);
                setLoading(false);
              }
              resolve();
            } else {
              setTimeout(() => checkPayPalReady(attempts + 1), 100);
            }
          };
          
          checkPayPalReady();
        };
        
        script.onerror = (err) => {
          clearTimeout(timeout);
          addDebugInfo(`PayPal SDK failed to load: ${err}`, 'error');
          script.remove();
          if (mountedRef.current) {
            setError('Failed to load payment system. Please check your connection.');
            setLoading(false);
          }
          reject(new Error('Failed to load PayPal SDK'));
        };
        
        document.head.appendChild(script);
        addDebugInfo('PayPal SDK script added to document head');
      });
        
    } catch (err) {
      addDebugInfo(`Error in loadPayPalSDK: ${err}`, 'error');
      if (mountedRef.current) {
        setError('Unable to initialize payment system. Please try again.');
        setLoading(false);
        onError(err);
      }
    } finally {
      sdkLoadingRef.current = false;
    }
  }, [fetchPayPalConfig, onError, addDebugInfo, cleanupPayPalResources]);

  // Enhanced button rendering with better cleanup
  const renderPayPalButtons = useCallback(() => {
    addDebugInfo('Attempting to render PayPal buttons...');
    
    if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
      addDebugInfo('PayPal SDK not available or not functional', 'error');
      setError('Payment system not ready. Please try again.');
      return;
    }

    if (!containerRef.current) {
      addDebugInfo('PayPal container reference not found', 'error');
      setError('Payment container not found. Please refresh the page.');
      return;
    }

    try {
      // Ensure container is clean
      containerRef.current.innerHTML = '';
      buttonsRenderedRef.current = false;
      addDebugInfo('Container cleared, creating PayPal buttons...');
      
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
          addDebugInfo('Creating PayPal order...');
          
          try {
            const { data: orderData, error } = await supabase.functions.invoke('create-paypal-order', {
              body: {
                amount: amount,
                currency: 'USD',
                description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount} USD`,
                tier: tier
              }
            });

            if (error) {
              addDebugInfo(`Error creating order: ${error.message}`, 'error');
              throw new Error('Unable to create payment order. Please try again.');
            }

            if (!orderData?.orderId) {
              addDebugInfo('No order ID in response', 'error');
              throw new Error('Payment order creation failed. Please try again.');
            }

            addDebugInfo(`Order created successfully: ${orderData.orderId}`);
            return orderData.orderId;
            
          } catch (createError) {
            addDebugInfo(`Error in createOrder: ${createError}`, 'error');
            onError(createError);
            throw createError;
          }
        },
        
        onApprove: async (data: any, actions: any) => {
          addDebugInfo('PayPal payment approved, capturing order...');
          try {
            const { data: captureData, error } = await supabase.functions.invoke('capture-paypal-order', {
              body: { orderId: data.orderID }
            });

            if (error) {
              addDebugInfo(`Error capturing payment: ${error.message}`, 'error');
              throw new Error('Payment processing failed. Please contact support.');
            }

            addDebugInfo('Payment captured successfully');
            onSuccess(captureData);
          } catch (captureError) {
            addDebugInfo(`Error capturing payment: ${captureError}`, 'error');
            onError(captureError);
          }
        },
        
        onError: (err: any) => {
          addDebugInfo(`PayPal payment error: ${JSON.stringify(err)}`, 'error');
          setError('Payment processing encountered an error. Please try again.');
          onError(err);
        },
        
        onCancel: (data: any) => {
          addDebugInfo('PayPal payment cancelled by user');
          onCancel();
        }
      };

      addDebugInfo('Rendering PayPal buttons...');
      
      window.paypal.Buttons(buttonsConfig).render(containerRef.current)
        .then(() => {
          addDebugInfo('PayPal buttons rendered successfully');
          buttonsRenderedRef.current = true;
        })
        .catch((renderError: any) => {
          addDebugInfo(`Error rendering PayPal buttons: ${renderError}`, 'error');
          buttonsRenderedRef.current = false;
          setError('Unable to display payment options. Please refresh the page.');
          onError(renderError);
        });

    } catch (err) {
      addDebugInfo(`Error in renderPayPalButtons: ${err}`, 'error');
      setError('Payment system error. Please try again.');
      onError(err);
    }
  }, [amount, tier, onSuccess, onError, onCancel, addDebugInfo]);

  // Enhanced retry logic
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please refresh the page or try again later.');
      return;
    }

    addDebugInfo(`Retrying PayPal SDK load... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
    
    // Clean up everything and start fresh
    cleanupPayPalResources();
    resetComponentState();
    setRetryCount(prev => prev + 1);
    
    // Delay before retry
    setTimeout(() => {
      if (mountedRef.current) {
        loadPayPalSDK();
      }
    }, 1000);
  }, [retryCount, addDebugInfo, cleanupPayPalResources, resetComponentState, loadPayPalSDK]);

  // Handle prop changes (plan selection changes)
  useEffect(() => {
    const currentProps = { amount, tier };
    const prevProps = prevPropsRef.current;
    
    if (currentProps.amount !== prevProps.amount || currentProps.tier !== prevProps.tier) {
      addDebugInfo(`Props changed - Amount: ${prevProps.amount} -> ${currentProps.amount}, Tier: ${prevProps.tier} -> ${currentProps.tier}`);
      
      // Clean up current buttons and re-render
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      buttonsRenderedRef.current = false;
      setError(null);
      
      // If SDK is loaded, re-render buttons immediately
      if (sdkLoaded && !loading && clientId) {
        addDebugInfo('SDK ready, re-rendering buttons for new plan');
        setTimeout(() => {
          if (mountedRef.current && !buttonsRenderedRef.current) {
            renderPayPalButtons();
          }
        }, 100);
      }
      
      prevPropsRef.current = currentProps;
    }
  }, [amount, tier, sdkLoaded, loading, clientId, addDebugInfo, renderPayPalButtons]);

  // Initial SDK loading
  useEffect(() => {
    mountedRef.current = true;
    addDebugInfo('Component mounted, initializing PayPal integration');
    
    if (!sdkLoaded && !sdkLoadingRef.current) {
      loadPayPalSDK();
    }

    return () => {
      mountedRef.current = false;
      addDebugInfo('Component unmounting, cleaning up');
    };
  }, [loadPayPalSDK, sdkLoaded, addDebugInfo]);

  // Render buttons when conditions are met
  useEffect(() => {
    if (sdkLoaded && 
        containerRef.current && 
        !loading && 
        !error && 
        clientId && 
        mountedRef.current && 
        !buttonsRenderedRef.current) {
      
      addDebugInfo('All conditions met, rendering buttons...');
      
      // Small delay to ensure DOM is stable
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && !buttonsRenderedRef.current) {
          renderPayPalButtons();
        }
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sdkLoaded, loading, error, clientId, renderPayPalButtons, addDebugInfo]);

  // Force button re-render function
  const forceRenderButtons = useCallback(() => {
    if (sdkLoaded && containerRef.current && !loading && !error && clientId) {
      addDebugInfo('Force re-rendering PayPal buttons...');
      
      // Clean container and reset state
      containerRef.current.innerHTML = '';
      buttonsRenderedRef.current = false;
      
      // Re-render after short delay
      setTimeout(() => {
        if (mountedRef.current && !buttonsRenderedRef.current) {
          renderPayPalButtons();
        }
      }, 100);
    }
  }, [sdkLoaded, loading, error, clientId, renderPayPalButtons, addDebugInfo]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 mb-2">Loading secure payment...</p>
          <p className="text-xs text-gray-500">Please wait while we prepare your payment options</p>
          
          {/* Debug panel only in development */}
          {isDevelopment && debugInfo.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug Info
              </button>
              {showDebugPanel && (
                <div className="mt-2 text-left bg-gray-100 p-2 rounded text-xs max-w-md mx-auto">
                  <div className="max-h-32 overflow-auto">
                    {debugInfo.map((info, index) => (
                      <div key={index} className={`mb-1 ${
                        info.level === 'error' ? 'text-red-600' : 
                        info.level === 'warn' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        <span className="font-mono">{info.timestamp}</span>: {info.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render error state
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm mb-3"
            >
              {loading ? 'Retrying...' : `Try Again ${retryCount > 0 ? `(${retryCount}/${MAX_RETRIES})` : ''}`}
            </button>
          )}
          
          {retryCount >= MAX_RETRIES && (
            <p className="text-xs text-gray-500 mb-3">
              Please refresh the page or contact support if the problem persists.
            </p>
          )}
          
          {/* Debug panel only in development */}
          {isDevelopment && debugInfo.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {showDebugPanel ? 'Hide' : 'Show'} Debug Info
              </button>
              {showDebugPanel && (
                <div className="mt-2 text-left bg-gray-100 p-2 rounded text-xs max-w-md mx-auto">
                  <div className="max-h-32 overflow-auto">
                    {debugInfo.map((info, index) => (
                      <div key={index} className={`mb-1 ${
                        info.level === 'error' ? 'text-red-600' : 
                        info.level === 'warn' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        <span className="font-mono">{info.timestamp}</span>: {info.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render payment interface
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
      
      {/* Refresh button for when buttons don't appear */}
      {sdkLoaded && !loading && !error && clientId && (
        <div className="text-center mt-4">
          <button
            onClick={forceRenderButtons}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Payment options not showing? Click to refresh
          </button>
        </div>
      )}
      
      {/* Debug panel only in development */}
      {isDevelopment && debugInfo.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {showDebugPanel ? '▲' : '▼'} Debug Info (Development Only)
          </button>
          {showDebugPanel && (
            <div className="mt-2 text-left bg-gray-100 p-2 rounded text-xs max-w-md mx-auto">
              <div className="max-h-32 overflow-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className={`mb-1 ${
                    info.level === 'error' ? 'text-red-600' : 
                    info.level === 'warn' ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    <span className="font-mono">{info.timestamp}</span>: {info.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayPalIntegration;