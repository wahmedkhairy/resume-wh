// src/components/PayPalIntegration.tsx
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window { paypal: any; }
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CLIENT_ID = 'AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E';

    // 1) Load PayPal SDK once
    if (!document.getElementById('paypal-sdk')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=USD;
      script.async = true;
      script.onload = () => setLoading(false);
      script.onerror = () => onError(new Error('Failed to load PayPal SDK'));
      document.head.appendChild(script);
    } else {
      // already loaded
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    // 2) When SDK is ready and container is in the DOM, render buttons
    if (!loading && window.paypal && containerRef.current) {
      containerRef.current.innerHTML = '';
      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect' },
        createOrder: (_data: any, actions: any) =>
          actions.order.create({
            purchase_units: [{
              amount: { currency_code: 'USD', value: amount },
              description: ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan – $${amount}
            }]
          }),
        onApprove: (_data: any, actions: any) =>
          actions.order.capture().then(details => {
            onSuccess(details);
          }),
        onError: (err: any) => onError(err),
        onCancel: () => onCancel()
      }).render(containerRef.current);
    }
  }, [loading, amount, tier, onSuccess, onError, onCancel]);

  if (loading) {
    return <p>Loading payment options…</p>;
  }

  return <div ref={containerRef} />;
};

export default PayPalIntegration;