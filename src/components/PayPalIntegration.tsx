
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

  // Use the correct PayPal Client ID you provided
  const CLIENT_ID = 'ATW52HhFLL9GSuqaUlDiXLhjc6puky0HqmKdmPGAhYRFcdZIu9qV5XowN4wT1td5GgwpQFgQvcq069V2';

  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  // Create order via your server-side function
  const createServerOrder = async (amount: string, tier: string) => {
    try {
      addDebugInfo('Creating order via server...');
      
      const response = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      if (data.error) {
        throw new Error(data.error);
      }

      addDebugInfo(`Order created successfully: ${data.orderId}`);
      return data.orderId;
      
    } catch (error) {
      addDebugInfo(`Error creating server order: ${error}`);
      throw error;
    }
  };

  // Capture order via your server-side function
  const captureServerOrder = async (orderId: string) => {
    try {
      addDebugInfo('Capturing order via server...');
      
      const response = await fetch('/api/capture-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      addDebugInfo(`Order captured successfully: ${data.transactionId}`);
      return data;
      
    } catch (error) {
      addDebugInfo(`Error capturing server order: ${error}`);
      throw error;
    }
  };

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        addDebugInfo('Starting PayPal SDK load...');
        
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
        
        // Enhanced SDK URL with additional parameters for better compatibility
        script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture&enable-funding=venmo,paylater&disable-funding=credit,card`;
        script.async = true;
        
        addDebugInfo(`SDK URL: ${script.src}`);
        
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
          setError('Failed to load PayPal SDK - Please check your internet connection');
          setLoading(false);
          onError(new Error('Failed to load PayPal SDK'));
        };
        
        document.head.appendChild(script);
        addDebugInfo('PayPal SDK script added to document head');
        
        // Timeout fallback
        setTimeout(() => {
          if (loading && !sdkLoaded) {
            addDebugInfo('SDK loading timeout - still loading after 15 seconds');
            setError('PayPal SDK loading timeout - Please refresh and try again');
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
  }, [CLIENT_ID, onError, loading, sdkLoaded]);

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
          height: 50,
          tagline: false
        },
        
        // Use server-side order creation
        createOrder: async (data: any, actions: any) => {
          try {
            addDebugInfo('Creating order via server-side function...');
            const orderId = await createServerOrder(amount, tier);
            addDebugInfo(`Server order created with ID: ${orderId}`);
            return orderId;
          } catch (error) {
            addDebugInfo('Error creating server order: ' + error);
            onError(error);
            throw error;
          }
        },
        
        // Use server-side order capture
        onApprove: async (data: any, actions: any) => {
          addDebugInfo(`PayPal payment approved, order ID: ${data.orderID}`);
          try {
            const captureResult = await captureServerOrder(data.orderID);
            addDebugInfo('Payment captured successfully via server');
            onSuccess({
              ...captureResult,
              orderID: data.orderID,
              payerID: data.payerID
            });
          } catch (captureError) {
            addDebugInfo('Error capturing payment via server: ' + captureError);
            onError(captureError);
          }
        },
        
        onError: (err: any) => {
          addDebugInfo('PayPal payment error: ' + JSON.stringify(err));
          setError('Payment processing error - Please try again');
          onError(err);
        },
        
        onCancel: (data: any) => {
          addDebugInfo('PayPal payment cancelled by user');
          onCancel();
        }
      };

      addDebugInfo('Rendering PayPal buttons with server-side configuration...');
      
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
    if (sdkLoaded && containerRef.current && !loading && !error) {
      addDebugInfo('Conditions met, rendering buttons...');
      const timeoutId = setTimeout(() => {
        renderPayPalButtons();
      }, 100);
      
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
            <p className="text-xs text-red-500">
              If this problem persists, please contact support.
            </p>
          </div>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              setSdkLoaded(false);
              setDebugInfo('');
              addDebugInfo('Retrying PayPal SDK load...');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm mb-3"
          >
            Try Again
          </button>
          <details className="text-xs text-gray-500 max-w-md">
            <summary className="cursor-pointer">Technical Details</summary>
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-700 font-medium">
            💳 Pay with PayPal, Credit or Debit Card
          </p>
          <p className="text-xs text-green-600 mt-1">
            Secure payment powered by PayPal • SSL encrypted
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