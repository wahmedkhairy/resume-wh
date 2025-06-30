
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface PayPalWindow extends Window {
  paypal?: any;
}

declare const window: PayPalWindow;

interface PayPalIntegrationProps {
  amount: string;             // e.g. "2.00"
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

  // Move CLIENT_ID to environment variable or config
  const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E';

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        // Check if PayPal is already loaded
        if (window.paypal) {
          console.log('PayPal SDK already loaded');
          setSdkLoaded(true);
          setLoading(false);
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.getElementById('paypal-sdk');
        if (existingScript) {
          console.log('PayPal SDK script already exists, waiting for load');
          existingScript.addEventListener('load', () => {
            setSdkLoaded(true);
            setLoading(false);
          });
          existingScript.addEventListener('error', () => {
            setError('Failed to load PayPal SDK');
            setLoading(false);
          });
          return;
        }

        console.log('Loading PayPal SDK...');
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture`;
        script.async = true;
        
        script.onload = () => {
          console.log('PayPal SDK loaded successfully');
          setSdkLoaded(true);
          setLoading(false);
        };
        
        script.onerror = (err) => {
          console.error('Failed to load PayPal SDK:', err);
          setError('Failed to load PayPal SDK');
          setLoading(false);
          onError(new Error('Failed to load PayPal SDK'));
        };
        
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading PayPal SDK:', err);
        setError('Error loading PayPal SDK');
        setLoading(false);
        onError(err);
      }
    };

    loadPayPalSDK();
  }, [CLIENT_ID, onError]);

  // Render PayPal buttons
  const renderPayPalButtons = useCallback(() => {
    console.log('Attempting to render PayPal buttons...');
    
    if (!window.paypal) {
      console.error('PayPal SDK not available');
      setError('PayPal SDK not available');
      return;
    }

    if (!containerRef.current) {
      console.error('PayPal container not found');
      setError('PayPal container not found');
      return;
    }

    try {
      // Clear existing content
      containerRef.current.innerHTML = '';
      
      console.log('Rendering PayPal buttons with amount:', amount, 'tier:', tier);
      
      window.paypal.Buttons({
        style: { 
          layout: 'vertical', 
          color: 'gold', 
          shape: 'rect',
          label: 'pay',
          height: 40
        },
        
        createOrder: (data: any, actions: any) => {
          console.log('Creating PayPal order...');
          return actions.order.create({
            purchase_units: [{
              amount: { 
                currency_code: 'USD', 
                value: amount 
              },
              description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount}`,
              custom_id: tier // Add tier info for webhook processing
            }],
            application_context: {
              brand_name: 'Resume Builder',
              locale: 'en-US',
              landing_page: 'BILLING',
              user_action: 'PAY_NOW'
            }
          });
        },
        
        onApprove: async (data: any, actions: any) => {
          console.log('PayPal payment approved, capturing order...');
          try {
            const details = await actions.order.capture();
            console.log('Payment captured successfully:', details);
            onSuccess(details);
          } catch (captureError) {
            console.error('Error capturing payment:', captureError);
            onError(captureError);
          }
        },
        
        onError: (err: any) => {
          console.error('PayPal payment error:', err);
          setError('Payment processing error');
          onError(err);
        },
        
        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data);
          onCancel();
        }
      }).render(containerRef.current).then(() => {
        console.log('PayPal buttons rendered successfully');
      }).catch((renderError: any) => {
        console.error('Error rendering PayPal buttons:', renderError);
        setError('Failed to render PayPal buttons');
        onError(renderError);
      });
    } catch (err) {
      console.error('Error in renderPayPalButtons:', err);
      setError('Error rendering PayPal buttons');
      onError(err);
    }
  }, [amount, tier, onSuccess, onError, onCancel]);

  // Render buttons when SDK is loaded and container is ready
  useEffect(() => {
    if (sdkLoaded && containerRef.current && !loading) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        renderPayPalButtons();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sdkLoaded, loading, renderPayPalButtons]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading PayPal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-3">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              setSdkLoaded(false);
              // Retry loading
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-container">
      <div 
        ref={containerRef} 
        id="paypal-button-container"
        className="min-h-[120px] w-full"
      />
    </div>
  );
};

export default PayPalIntegration;
