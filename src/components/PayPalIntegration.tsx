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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  
  // Track if component is mounted to prevent state updates after unmount
  const mountedRef = useRef(true);
  const sdkLoadingRef = useRef(false);
  const buttonsRenderedRef = useRef(false);
  const currentButtonsRef = useRef<any>(null); // Track current PayPal buttons instance
  
  // Track previous props to detect changes
  const prevPropsRef = useRef({ amount, tier });

  // More robust development environment detection
  const isDevelopment = 
    process.env.NODE_ENV === 'development' || 
    process.env.REACT_APP_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.hostname.includes('dev') ||
    window.location.port !== '';
  
  const MAX_RETRIES = 3;
  const SDK_TIMEOUT = 20000;

  const addDebugInfo = useCallback((info: string) => {
    // Only log to console and store debug info in development
    if (isDevelopment) {
      console.log(`[PayPal Debug] ${info}`);
      if (mountedRef.current) {
        setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
      }
    }
  }, [isDevelopment]);

  // Clean up existing PayPal buttons properly
  const cleanupPayPalButtons = useCallback(() => {
    addDebugInfo('Cleaning up existing PayPal buttons...');
    
    // Close/destroy existing buttons instance
    if (currentButtonsRef.current && typeof currentButtonsRef.current.close === 'function') {
      try {
        currentButtonsRef.current.close();
        addDebugInfo('Existing PayPal buttons closed');
      } catch (e) {
        addDebugInfo(`Error closing PayPal buttons: ${e}`);
      }
    }
    currentButtonsRef.current = null;
    
    // Clear container content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      addDebugInfo('PayPal container cleared');
    }
    
    buttonsRenderedRef.current = false;
  }, [addDebugInfo]);

  // Fetch PayPal Client ID from secure backend
  const fetchPayPalConfig = useCallback(async () => {
    try {
      addDebugInfo('Fetching PayPal configuration...');
      
      const { data, error } = await supabase.functions.invoke('get-paypal-config');
      
      if (error) {
        addDebugInfo(`Error fetching PayPal config: ${error.message}`);
        throw new Error(`Failed to fetch PayPal configuration: ${error.message}`);
      }
      
      if (!data?.clientId) {
        addDebugInfo('No client ID in response');
        throw new Error('PayPal Client ID not configured');
      }
      
      addDebugInfo('PayPal Client ID fetched successfully');
      if (mountedRef.current) {
        setClientId(data.clientId);
      }
      return data.clientId;
      
    } catch (err) {
      addDebugInfo(`Error in fetchPayPalConfig: ${err}`);
      if (mountedRef.current) {
        setError('Unable to load payment system. Please try again.');
        onError(err);
      }
      throw err;
    }
  }, [onError, addDebugInfo]);

  // Clean up existing PayPal scripts
  const cleanupPayPalScripts = useCallback(() => {
    const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existingScripts.forEach(script => {
      addDebugInfo('Removing existing PayPal script');
      script.remove();
    });
    
    // Clean up PayPal button instances and global state
    cleanupPayPalButtons();
    
    // Also remove from window object - but be careful not to break other instances
    if (window.paypal && typeof window.paypal.Buttons === 'function') {
      addDebugInfo('PayPal SDK found in window, keeping for potential reuse');
    }
  }, [addDebugInfo, cleanupPayPalButtons]);

  // Load PayPal SDK with improved error handling
  const loadPayPalSDK = useCallback(async () => {
    if (sdkLoadingRef.current) {
      addDebugInfo('SDK loading already in progress, skipping...');
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

      // First fetch the client ID
      const fetchedClientId = await fetchPayPalConfig();
      
      if (!mountedRef.current) return;

      // Clean up any existing scripts but preserve functional SDK
      if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
        cleanupPayPalScripts();
      }

      addDebugInfo('Creating new PayPal SDK script...');
      
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'paypal-sdk-' + Date.now(); // Unique ID to avoid conflicts
        script.src = `https://www.paypal.com/sdk/js?client-id=${fetchedClientId}&currency=USD&intent=capture`;
        script.async = true;
        
        addDebugInfo(`SDK URL: ${script.src}`);
        
        const timeout = setTimeout(() => {
          addDebugInfo('SDK loading timeout reached');
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
          
          // Wait a bit for PayPal object to be fully initialized
          setTimeout(() => {
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
              addDebugInfo('PayPal SDK fully initialized');
              if (mountedRef.current) {
                setSdkLoaded(true);
                setLoading(false);
              }
              resolve();
            } else {
              addDebugInfo('PayPal object not properly initialized');
              if (mountedRef.current) {
                setError('Payment system failed to initialize. Please try again.');
                setLoading(false);
              }
              reject(new Error('PayPal SDK loaded but not functional'));
            }
          }, 1000);
        };
        
        script.onerror = (err) => {
          clearTimeout(timeout);
          addDebugInfo(`PayPal SDK failed to load: ${err}`);
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
      addDebugInfo(`Error in loadPayPalSDK: ${err}`);
      if (mountedRef.current) {
        setError('Unable to initialize payment system. Please try again.');
        setLoading(false);
        onError(err);
      }
    } finally {
      sdkLoadingRef.current = false;
    }
  }, [fetchPayPalConfig, onError, addDebugInfo, cleanupPayPalScripts]);

  // Render PayPal buttons with better error handling and cleanup
  const renderPayPalButtons = useCallback(() => {
    addDebugInfo('Attempting to render PayPal buttons...');
    
    if (!window.paypal || typeof window.paypal.Buttons !== 'function') {
      addDebugInfo('PayPal SDK not available or not functional');
      setError('Payment system not ready. Please try again.');
      return;
    }

    if (!containerRef.current) {
      addDebugInfo('PayPal container reference not found');
      setError('Payment container not found. Please refresh the page.');
      return;
    }

    // Clean up any existing buttons first
    cleanupPayPalButtons();

    try {
      addDebugInfo('Container cleared, creating PayPal buttons...');
      
      const buttonsConfig = {
        style: { 
          layout: 'vertical' as const,
          color: 'gold' as const,
          shape: 'rect' as const,
          label: 'pay' as const,
          height: 45
        },
        
        createOrder: async (data: any, actions: any) => {
          addDebugInfo('Creating PayPal order...');
          
          try {
            const { data: orderData, error } = await supabase.functions.invoke('create-paypal-order', {
              body: {
                amount: amount,
                currency: 'USD',
                description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount}`,
                tier: tier
              }
            });

            if (error) {
              addDebugInfo(`Error creating order: ${error.message}`);
              throw new Error('Unable to create payment order. Please try again.');
            }

            if (!orderData?.orderId) {
              addDebugInfo('No order ID in response');
              throw new Error('Payment order creation failed. Please try again.');
            }

            addDebugInfo(`Order created successfully: ${orderData.orderId}`);
            return orderData.orderId;
            
          } catch (createError) {
            addDebugInfo(`Error in createOrder: ${createError}`);
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
              addDebugInfo(`Error capturing payment: ${error.message}`);
              throw new Error('Payment processing failed. Please contact support.');
            }

            addDebugInfo('Payment captured successfully');
            onSuccess(captureData);
          } catch (captureError) {
            addDebugInfo(`Error capturing payment: ${captureError}`);
            onError(captureError);
          }
        },
        
        onError: (err: any) => {
          addDebugInfo(`PayPal payment error: ${JSON.stringify(err)}`);
          setError('Payment processing encountered an error. Please try again.');
          onError(err);
        },
        
        onCancel: (data: any) => {
          addDebugInfo('PayPal payment cancelled by user');
          onCancel();
        }
      };

      addDebugInfo('Rendering PayPal buttons...');
      
      // Create and render the buttons
      const buttonsInstance = window.paypal.Buttons(buttonsConfig);
      
      buttonsInstance.render(containerRef.current)
        .then(() => {
          addDebugInfo('PayPal buttons rendered successfully');
          buttonsRenderedRef.current = true;
          currentButtonsRef.current = buttonsInstance; // Store reference for cleanup
        })
        .catch((renderError: any) => {
          addDebugInfo(`Error rendering PayPal buttons: ${renderError}`);
          buttonsRenderedRef.current = false;
          currentButtonsRef.current = null;
          setError('Unable to display payment options. Please refresh the page.');
          onError(renderError);
        });

    } catch (err) {
      addDebugInfo(`Error in renderPayPalButtons: ${err}`);
      setError('Payment system error. Please try again.');
      onError(err);
    }
  }, [amount, tier, onSuccess, onError, onCancel, addDebugInfo, cleanupPayPalButtons]);

  // Force re-render of buttons (useful for plan changes)
  const forceRenderButtons = useCallback(() => {
    if (sdkLoaded && containerRef.current && !loading && !error && clientId) {
      addDebugInfo('Force re-rendering PayPal buttons...');
      renderPayPalButtons();
    }
  }, [sdkLoaded, loading, error, clientId, renderPayPalButtons, addDebugInfo]);

  // Handle retry logic
  const handleRetry = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please refresh the page or try again later.');
      return;
    }

    setError(null);
    setLoading(true);
    setSdkLoaded(false);
    setClientId('');
    setDebugInfo('');
    setRetryCount(prev => prev + 1);
    
    // Clean up existing buttons
    cleanupPayPalButtons();
    
    addDebugInfo(`Retrying PayPal SDK load... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
    
    // Small delay before retry
    setTimeout(() => {
      loadPayPalSDK();
    }, 1000);
  }, [retryCount, addDebugInfo, loadPayPalSDK, cleanupPayPalButtons]);

  // Reset component state when props change (e.g., different plan selected)
  useEffect(() => {
    const currentProps = { amount, tier };
    const prevProps = prevPropsRef.current;
    
    if (currentProps.amount !== prevProps.amount || currentProps.tier !== prevProps.tier) {
      addDebugInfo(`Props changed - Amount: ${prevProps.amount} -> ${currentProps.amount}, Tier: ${prevProps.tier} -> ${currentProps.tier}`);
      
      // Clean up existing buttons when props change
      cleanupPayPalButtons();
      
      // Reset component state for new plan
      setError(null);
      setRetryCount(0);
      
      // If SDK is already loaded, re-render buttons immediately
      if (sdkLoaded && !loading && clientId) {
        addDebugInfo('SDK already loaded, re-rendering buttons for new plan');
        setTimeout(() => {
          if (mountedRef.current) {
            renderPayPalButtons();
          }
        }, 100);
      }
      
      prevPropsRef.current = currentProps;
    }
  }, [amount, tier, sdkLoaded, loading, clientId, addDebugInfo, cleanupPayPalButtons, renderPayPalButtons]);

  // Main effect to load SDK
  useEffect(() => {
    mountedRef.current = true;
    
    // Only load SDK if not already loaded
    if (!sdkLoaded && !sdkLoadingRef.current) {
      loadPayPalSDK();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [loadPayPalSDK, sdkLoaded]);

  // Effect to render buttons when SDK is ready
  useEffect(() => {
    if (sdkLoaded && containerRef.current && !loading && !error && clientId && mountedRef.current && !buttonsRenderedRef.current) {
      addDebugInfo('All conditions met, rendering buttons...');
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && !buttonsRenderedRef.current) {
          renderPayPalButtons();
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sdkLoaded, loading, error, clientId, renderPayPalButtons, addDebugInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanupPayPalButtons();
    };
  }, [cleanupPayPalButtons]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 mb-2">Loading secure payment...</p>
          {/* Debug info only shown in development */}
          {isDevelopment && debugInfo && (
            <details className="text-xs text-gray-500 max-w-md">
              <summary className="cursor-pointer">Debug Info (Development Only)</summary>
              <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

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
          {/* Debug info only shown in development */}
          {isDevelopment && debugInfo && (
            <details className="text-xs text-gray-500 max-w-md">
              <summary className="cursor-pointer">Debug Info (Development Only)</summary>
              <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                {debugInfo}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

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
      
      {/* Show refresh button if buttons don't appear after some time */}
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
      
      {/* Debug info only shown in development environment */}
      {isDevelopment && debugInfo && (
        <details className="text-xs text-gray-500 mt-4">
          <summary className="cursor-pointer">🔧 Debug Info (Development Only)</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32 whitespace-pre-wrap">
            {debugInfo}
          </pre>
        </details>
      )}
    </div>
  );
};

export default PayPalIntegration;
