
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PayPalSmartButtonsProps {
  amount: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
}

const PayPalSmartButtons: React.FC<PayPalSmartButtonsProps> = ({
  amount = "2.00",
  onSuccess,
  onError
}) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Using your latest PayPal Live Client ID directly
    const liveClientId = 'AWiv-6cjprQeRqz07LMIvHDtAJ22f6BVGcpgQHXMT0n2zJ8CFAtgzMT4_v-bhLWmdswIp2E9ExU1NX5E';

    const loadPayPalScript = () => {
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) existingScript.remove();

      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${liveClientId}&currency=USD`;
      script.async = true;

      script.onload = () => {
        console.log('✅ PayPal SDK loaded');
        initializePayPalButtons();
      };

      script.onerror = () => {
        console.error('❌ Failed to load PayPal SDK');
        toast({
          title: "PayPal Error",
          description: "Could not load PayPal. Check your connection or configuration.",
          variant: "destructive"
        });
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    const initializePayPalButtons = () => {
      if (!(window as any).paypal || !paypalContainerRef.current) {
        console.error('❌ PayPal SDK or container not available');
        return;
      }

      paypalContainerRef.current.innerHTML = '';

      (window as any).paypal.Buttons({
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: "USD",
                value: amount
              }
            }]
          });
        },
        onApprove: (_data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            console.log('✅ Payment captured:', details);

            toast({
              title: "Payment Successful!",
              description: `Transaction completed by ${details.payer.name.given_name}`,
            });

            const paymentData = {
              name: details.payer.name.given_name,
              amount: details.purchase_units[0].amount.value,
              payment_id: details.id,
              payer_email: details.payer.email_address,
              transaction_id: details.purchase_units[0].payments.captures[0].id
            };

            fetch(`https://wjijfiwweppsxcltggna.functions.supabase.co/store-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentData)
            })
            .then(res => res.text())
            .then(msg => {
              console.log("📝 Supabase saved payment:", msg);
              toast({
                title: "Payment Saved",
                description: "Payment information saved successfully."
              });
            })
            .catch(err => {
              console.error("⚠️ Supabase save failed:", err);
              toast({
                title: "Warning",
                description: "Payment succeeded but saving details failed.",
                variant: "destructive"
              });
            });

            if (onSuccess) onSuccess(details);
          });
        },
        onError: (err: any) => {
          console.error('❌ PayPal error:', err);
          toast({
            title: "Payment Failed",
            description: "There was a problem with your payment.",
            variant: "destructive"
          });
          if (onError) onError(err);
        },
        onCancel: (_data: any) => {
          console.log('⛔ Payment cancelled');
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the transaction."
          });
        }
      }).render(paypalContainerRef.current);

      setIsLoading(false);
    };

    loadPayPalScript();

    return () => {
      const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (script) script.remove();
    };
  }, [amount, onSuccess, onError, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-gray-300 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-sm text-gray-600">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        id="paypal-button-container" 
        ref={paypalContainerRef}
        className="min-h-[50px] w-full"
      />
      <p className="text-xs text-center text-gray-500 mt-2">
        Secure payment powered by PayPal
      </p>
    </div>
  );
};

export default PayPalSmartButtons;
