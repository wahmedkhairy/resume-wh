
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
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  // Fetch PayPal Client ID from secure backend
  const fetchPayPalConfig = useCallback(async () => {
    try {
      addDebugInfo('Fetching PayPal configuration...');
      
      const { data, error } = await supabase.functions.invoke('get-paypal-config');
      
      if (error) {
        addDebugInfo('Error fetching PayPal config: ' + error.message);
        throw new Error('Failed to fetch PayPal configuration: ' + error.message);
      }
      
      if (!data?.clientId) {
        addDebugInfo('No client ID in response');
        throw new Error('PayPal Client ID not configured');
      }
      
      addDebugInfo('PayPal Client ID fetched successfully');
      setClientId(data.clientId);
      return data.clientId;
      
    } catch (err) {
      addDebugInfo('Error in fetchPayPalConfig: ' + err);
      setError('Failed to load PayPal configuration');
      onError(err);
      throw err;
    }
  }, [onError]);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        addDebugInfo('Starting PayPal SDK load...');
        
        // First fetch the client ID
        const fetchedClientId = await fetchPayPalConfig();
        
        // Check if PayPal is already loaded
        if (window.paypal) {
          addDebugInfo('PayPal SDK already loaded');
          setSdkLoaded(true);
          setLoading(false);
          return;
        }

        // Remove any existing PayPal scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
        existingScripts.forEach(script => {
          addDebugInfo('Removing existing PayPal script');
          script.remove();
        });

        addDebugInfo('Creating new PayPal SDK script...');
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        
        // Use the fetched client ID
        script.src = `https://www.paypal.com/sdk/js?client-id=${fetchedClientId}&currency=USD`;
        script.async = true;
        
        addDebugInfo(`SDK URL: ${script.src.substring(0, 100)}...`);
        
        script.onload = () => {
          addDebugInfo('PayPal SDK loaded successfully');
          if (window.paypal) {
            addDebugInfo('PayPal object is available');
            setSdkLoaded(true);
          } else {
            addDebugInfo('PayPal object not found after load');
            setError('PayPal SDK loaded but object not available');
          }
          setLoading(false);
        };
        
        script.onerror = (err) => {
          addDebugInfo('PayPal SDK failed to load: ' + err);
          setError('Failed to load PayPal SDK - Network or URL error');
          setLoading(false);
          onError(new Error('Failed to load PayPal SDK'));
        };
        
        document.head.appendChild(script);
        addDebugInfo('PayPal SDK script added to document head');
        
        // Timeout fallback
        setTimeout(() => {
          if (loading && !sdkLoaded) {
            addDebugInfo('SDK loading timeout - still loading after 15 seconds');
            setError('PayPal SDK loading timeout');
            setLoading(false);
          }
        }, 15000);
        
      } catch (err) {
        addDebugInfo('Error in loadPayPalSDK: ' + err);
        setError('Error loading PayPal SDK: ' + err);
        setLoading(false);
        onError(err);
      }
    };

    loadPayPalSDK();
  }, [fetchPayPalConfig, onError, loading, sdkLoaded]);

  // Render PayPal buttons
  const renderPayPalButtons = useCallback(() => {
    addDebugInfo('Attempting to render PayPal buttons...');
    
    if (!window.paypal) {
      addDebugInfo('PayPal SDK not available on window object');
      setError('PayPal SDK not available');
      return;
    }

    if (!containerRef.current) {
      addDebugInfo('PayPal container reference not found');
      setError('PayPal container not found');
      return;
    }

    try {
      // Clear existing content
      containerRef.current.innerHTML = '';
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
          addDebugInfo('Creating PayPal order through Supabase function...');
          
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
              addDebugInfo('Error creating order: ' + error.message);
              throw new Error('Failed to create order: ' + error.message);
            }

            if (!orderData?.orderId) {
              addDebugInfo('No order ID in response');
              throw new Error('No order ID received');
            }

            addDebugInfo('Order created successfully: ' + orderData.orderId);
            return orderData.orderId;
            
          } catch (createError) {
            addDebugInfo('Error in createOrder: ' + createError);
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
              addDebugInfo('Error capturing payment: ' + error.message);
              throw new Error('Failed to capture payment: ' + error.message);
            }

            addDebugInfo('Payment captured successfully');
            onSuccess(captureData);
          } catch (captureError) {
            addDebugInfo('Error capturing payment: ' + captureError);
            onError(captureError);
          }
        },
        
        onError: (err: any) => {
          addDebugInfo('PayPal payment error: ' + err);
          setError('Payment processing error');
          onError(err);
        },
        
        onCancel: (data: any) => {
          addDebugInfo('PayPal payment cancelled');
          onCancel();
        }
      };

      addDebugInfo('Rendering PayPal buttons with config...');
      
      window.paypal.Buttons(buttonsConfig).render(containerRef.current).then(() => {
        addDebugInfo('PayPal buttons rendered successfully');
      }).catch((renderError: any) => {
        addDebugInfo('Error rendering PayPal buttons: ' + renderError);
        setError('Failed to render PayPal buttons: ' + renderError.message);
        onError(renderError);
      });

    } catch (err) {
      addDebugInfo('Error in renderPayPalButtons: ' + err);
      setError('Error rendering PayPal buttons: ' + err);
      onError(err);
    }
  }, [amount, tier, onSuccess, onError, onCancel]);

  // Render buttons when SDK is loaded
  useEffect(() => {
    if (sdkLoaded && containerRef.current && !loading && !error && clientId) {
      addDebugInfo('Conditions met, rendering buttons...');
      const timeoutId = setTimeout(() => {
        renderPayPalButtons();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sdkLoaded, loading, error, clientId, renderPayPalButtons]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 mb-2">Loading PayPal...</p>
          <details className="text-xs text-gray-500 max-w-md">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {debugInfo}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              setSdkLoaded(false);
              setClientId('');
              setDebugInfo('');
              addDebugInfo('Retrying PayPal SDK load...');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mb-3"
          >
            Retry
          </button>
          <details className="text-xs text-gray-500 max-w-md">
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 text-left bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
              {debugInfo}
            </pre>
          </details>
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
      </div>
      
      <div 
        ref={containerRef} 
        id="paypal-button-container"
        className="min-h-[50px] w-full"
      />
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500 mt-4">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
            {debugInfo}
          </pre>
        </details>
      )}
    </div>
  );
};

export default PayPalIntegration;
