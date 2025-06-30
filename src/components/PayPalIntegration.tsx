
// src/components/PayPalIntegration.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window { 
    paypal: any; 
  }
}

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
  const [useServerSide, setUseServerSide] = useState(false);

  // Use the correct PayPal Client ID you provided
  const CLIENT_ID = 'ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2';

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  // Test if server-side functions are available
  const testServerEndpoints = async () => {
    try {
      // Replace with your actual Supabase URL
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      
      if (!supabaseUrl) {
        addDebugInfo('No Supabase URL configured, using client-side mode');
        return false;
      }

      const testUrl = `${supabaseUrl}/functions/v1/create-paypal-order`;
      addDebugInfo(`Testing server endpoint: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'OPTIONS', // Test CORS preflight
      });
      
      if (response.ok) {
        addDebugInfo('Server endpoints available, using server-side mode');
        return true;
      } else {
        addDebugInfo('Server endpoints not available, using client-side mode');
        return false;
      }
    } catch (error) {
      addDebugInfo(`Server test failed: ${error}, using client-side mode`);
      return false;
    }
  };

  // Create order via server-side function
  const createServerOrder = async (amount: string, tier: string) => {
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/create-paypal-order`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'USD',
          description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount}`,
          tier: tier
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data.orderId;
    } catch (error) {
      throw error;
    }
  };

  // Capture order via server-side function
  const captureServerOrder = async (orderId: string) => {
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const functionUrl = `${supabaseUrl}/functions/v1/capture-paypal-order`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        addDebugInfo('Starting PayPal SDK load...');
        
        // Test server endpoints first
        const serverAvailable = await testServerEndpoints();
        setUseServerSide(serverAvailable);
        
        // Check if PayPal is already loaded
        if (window.paypal) {
          addDebugInfo('PayPal SDK already loaded');
          setSdkLoaded(true);
          setLoading(false);
          return;
        }

        // Remove any existing PayPal scripts
        const existingScripts = document.querySelectorAll('script[src*="paypal.com/sdk"]');
        existingScripts.forEach(script => script.remove());

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        
        // SDK URL configured to show credit/debit card options
        script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture&enable-funding=card,venmo&components=buttons,marks`;
        script.async = true;
        
        addDebugInfo(`SDK URL: ${script.src}`);
        
        script.onload = () => {
          addDebugInfo('PayPal SDK loaded successfully');
          if (window.paypal) {
            setSdkLoaded(true);
          } else {
            setError('PayPal SDK loaded but object not available');
          }
          setLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to load PayPal SDK');
          setLoading(false);
        };
        
        document.head.appendChild(script);
        
      } catch (err) {
        addDebugInfo('Error in loadPayPalSDK: ' + err);
        setError('Error loading PayPal SDK');
        setLoading(false);
      }
    };

    loadPayPalSDK();
  }, []);

  // Render PayPal buttons
  const renderPayPalButtons = useCallback(() => {
    if (!window.paypal || !containerRef.current) return;

    try {
      containerRef.current.innerHTML = '';
      addDebugInfo(`Rendering PayPal buttons (${useServerSide ? 'server-side' : 'client-side'} mode)`);
      
      const buttonsConfig = {
        style: { 
          layout: 'vertical' as const,
          color: 'gold' as const,
          shape: 'rect' as const,
          label: 'pay' as const,
          height: 50
        },
        
        createOrder: async (data: any, actions: any) => {
          try {
            if (useServerSide) {
              addDebugInfo('Creating order via server...');
              return await createServerOrder(amount, tier);
            } else {
              addDebugInfo('Creating order via client...');
              return actions.order.create({
                purchase_units: [{
                  amount: { 
                    currency_code: 'USD', 
                    value: amount 
                  },
                  description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount}`,
                }],
                application_context: {
                  shipping_preference: 'NO_SHIPPING'
                }
              });
            }
          } catch (error) {
            addDebugInfo('Error in createOrder: ' + error);
            onError(error);
            throw error;
          }
        },
        
        onApprove: async (data: any, actions: any) => {
          try {
            addDebugInfo(`Payment approved, order ID: ${data.orderID}`);
            
            if (useServerSide) {
              const result = await captureServerOrder(data.orderID);
              onSuccess(result);
            } else {
              const details = await actions.order.capture();
              onSuccess(details);
            }
          } catch (error) {
            addDebugInfo('Error in onApprove: ' + error);
            onError(error);
          }
        },
        
        onError: (err: any) => {
          addDebugInfo('PayPal error: ' + JSON.stringify(err));
          onError(err);
        },
        
        onCancel: () => {
          addDebugInfo('Payment cancelled');
          onCancel();
        }
      };

      window.paypal.Buttons(buttonsConfig).render(containerRef.current);
      addDebugInfo('PayPal buttons rendered successfully');

    } catch (err) {
      addDebugInfo('Error rendering buttons: ' + err);
      setError('Error rendering PayPal buttons');
    }
  }, [amount, tier, useServerSide, onSuccess, onError, onCancel]);

  useEffect(() => {
    if (sdkLoaded && !loading && !error) {
      const timeoutId = setTimeout(renderPayPalButtons, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [sdkLoaded, loading, error, renderPayPalButtons]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 mb-2">Loading secure payment...</p>
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600 mb-2">{error}</p>
          </div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              setSdkLoaded(false);
              setDebugInfo('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mb-3"
          >
            Try Again
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-blue-700 font-medium">
            💳 Pay with PayPal, Credit or Debit Card
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {useServerSide ? 'Server-side' : 'Client-side'} processing • SSL encrypted
          </p>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        id="paypal-button-container"
        className="min-h-[60px] w-full"
      />
      
      <div className="text-center mt-3">
        <p className="text-xs text-gray-500">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
      
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