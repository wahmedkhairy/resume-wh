
// src/components/PayPalIntegration.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window { 
    paypal: any; 
  }
}

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
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Move CLIENT_ID to environment variable or config
  const CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || 'AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E';

  // Load PayPal SDK with all funding sources enabled
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
        
        // Enable ALL funding sources including credit/debit cards
        script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD&intent=capture&enable-funding=venmo,paylater,card&components=buttons,funding-eligibility,payment-fields&disable-funding=`;
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

  // Create order function (shared between payment methods)
  const createOrder = useCallback((data: any, actions: any) => {
    console.log('Creating PayPal order...');
    return actions.order.create({
      purchase_units: [{
        amount: { 
          currency_code: 'USD', 
          value: amount 
        },
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount}`,
        custom_id: tier
      }],
      application_context: {
        brand_name: 'Resume Builder',
        locale: 'en-US',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        payment_method: {
          payee_preferred: 'UNRESTRICTED' // Critical: Allows credit cards without PayPal account
        }
      }
    });
  }, [amount, tier]);

  // Approve order function (shared between payment methods)
  const onApprove = useCallback(async (data: any, actions: any) => {
    console.log('PayPal payment approved, capturing order...');
    try {
      const details = await actions.order.capture();
      console.log('Payment captured successfully:', details);
      onSuccess(details);
    } catch (captureError) {
      console.error('Error capturing payment:', captureError);
      onError(captureError);
    }
  }, [onSuccess, onError]);

  // Render PayPal buttons for different funding sources
  const renderPaymentButtons = useCallback(() => {
    console.log('Attempting to render payment buttons...');
    
    if (!window.paypal) {
      console.error('PayPal SDK not available');
      setError('PayPal SDK not available');
      return;
    }

    if (!paypalContainerRef.current) {
      console.error('PayPal container not found');
      setError('PayPal container not found');
      return;
    }

    try {
      // Clear existing content
      paypalContainerRef.current.innerHTML = '';
      
      console.log('Rendering PayPal buttons with amount:', amount, 'tier:', tier);
      
      // Primary PayPal button (includes credit/debit cards)
      window.paypal.Buttons({
        style: { 
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 45,
          tagline: false
        },
        
        createOrder,
        onApprove,
        
        onError: (err: any) => {
          console.error('PayPal payment error:', err);
          setError('Payment processing error');
          onError(err);
        },
        
        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data);
          onCancel();
        }
      }).render(paypalContainerRef.current).then(() => {
        console.log('PayPal buttons rendered successfully');
      }).catch((renderError: any) => {
        console.error('Error rendering PayPal buttons:', renderError);
        setError('Failed to render PayPal buttons');
        onError(renderError);
      });

    } catch (err) {
      console.error('Error in renderPaymentButtons:', err);
      setError('Error rendering payment buttons');
      onError(err);
    }
  }, [amount, tier, createOrder, onApprove, onError, onCancel]);

  // Render buttons when SDK is loaded and container is ready
  useEffect(() => {
    if (sdkLoaded && paypalContainerRef.current && !loading) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        renderPaymentButtons();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sdkLoaded, loading, renderPaymentButtons]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading payment options...</p>
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
    <div className="payment-container space-y-4">
      {/* Payment method info */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Pay with PayPal, Credit Card, or Debit Card
        </p>
        <p className="text-xs text-gray-500">
          No PayPal account required for card payments
        </p>
      </div>
      
      {/* PayPal payment buttons */}
      <div className="paypal-payment-section">
        <div 
          ref={paypalContainerRef} 
          id="paypal-button-container"
          className="min-h-[50px] w-full"
        />
      </div>
      
      {/* Security badges */}
      <div className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure Payment
        </div>
        <div className="text-xs text-gray-500">
          Powered by PayPal
        </div>
      </div>
    </div>
  );
};

export default PayPalIntegration;