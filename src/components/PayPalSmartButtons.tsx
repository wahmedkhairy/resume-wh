
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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get PayPal Client ID from localStorage
    const liveClientId = localStorage.getItem('paypal_live_client_id');
    
    if (!liveClientId) {
      console.error('PayPal Live Client ID not found in localStorage');
      toast({
        title: "Configuration Error",
        description: "PayPal Live Client ID is required. Please configure it in settings.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const loadPayPalScript = () => {
      // Remove existing PayPal script if any
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create new PayPal SDK script
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${liveClientId}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        setIsScriptLoaded(true);
        initializePayPalButtons();
      };

      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        toast({
          title: "PayPal Loading Error",
          description: "Failed to load PayPal SDK. Please check your internet connection.",
          variant: "destructive"
        });
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    const initializePayPalButtons = () => {
      if (!(window as any).paypal || !paypalContainerRef.current) {
        console.error('PayPal SDK or container not available');
        return;
      }

      // Clear any existing content
      paypalContainerRef.current.innerHTML = '';

      try {
        (window as any).paypal.Buttons({
          createOrder: function(data: any, actions: any) {
            console.log('Creating PayPal order for amount:', amount);
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount
                }
              }]
            });
          },
          onApprove: function(data: any, actions: any) {
            console.log('PayPal payment approved:', data);
            return actions.order.capture().then(function(details: any) {
              console.log('PayPal payment captured:', details);
              
              toast({
                title: "Payment Successful!",
                description: `Transaction completed by ${details.payer.name.given_name}`,
              });

              // Send payment info to Supabase Edge Function
              const paymentData = {
                name: details.payer.name.given_name,
                amount: details.purchase_units[0].amount.value,
                payment_id: details.id,
                payer_email: details.payer.email_address,
                transaction_id: details.purchase_units[0].payments.captures[0].id
              };

              console.log('Sending payment data to Supabase:', paymentData);

              fetch(`https://wjijfiwweppsxcltggna.functions.supabase.co/store-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
              })
              .then(res => res.text())
              .then(msg => {
                console.log("Supabase response:", msg);
                toast({
                  title: "Payment Recorded",
                  description: "Payment information saved successfully."
                });
              })
              .catch(err => {
                console.error("Error saving payment:", err);
                toast({
                  title: "Warning",
                  description: "Payment successful but failed to save details. Please contact support.",
                  variant: "destructive"
                });
              });

              if (onSuccess) {
                onSuccess(details);
              }
            });
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            toast({
              title: "Payment Error",
              description: "There was an error processing your payment. Please try again.",
              variant: "destructive"
            });
            if (onError) {
              onError(err);
            }
          },
          onCancel: function(data: any) {
            console.log('PayPal payment cancelled:', data);
            toast({
              title: "Payment Cancelled",
              description: "Your payment was cancelled."
            });
          }
        }).render(paypalContainerRef.current);

        setIsLoading(false);
        console.log('PayPal buttons rendered successfully');
      } catch (error) {
        console.error('Error initializing PayPal buttons:', error);
        toast({
          title: "PayPal Error",
          description: "Failed to initialize PayPal buttons.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    loadPayPalScript();

    return () => {
      // Cleanup: remove script on unmount
      const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (script) {
        script.remove();
      }
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
