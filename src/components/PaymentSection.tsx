
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PayPalCheckout from "./PayPalCheckout";
import PayPalSmartButtons from "./PayPalSmartButtons";
import PayPalButton from "./PayPalButton";
import { PayPalOrderData } from "@/services/paypalService";

interface PaymentSectionProps {
  orderData: PayPalOrderData;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
  useSmartButtons?: boolean;
  useNewButton?: boolean;
  useRawHTML?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel,
  useSmartButtons = false,
  useNewButton = false,
  useRawHTML = true
}) => {
  useEffect(() => {
    if (useRawHTML) {
      // Get PayPal Live Client ID from localStorage
      const liveClientId = localStorage.getItem('paypal_live_client_id');
      
      if (!liveClientId) {
        console.error('PayPal Live Client ID not found in localStorage');
        return;
      }

      // Remove existing PayPal script if any
      const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Create and inject PayPal SDK script
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${liveClientId}&currency=USD`;
      script.async = true;
      
      script.onload = () => {
        console.log('PayPal SDK loaded successfully');
        
        // Initialize PayPal buttons
        if ((window as any).paypal) {
          (window as any).paypal.Buttons({
            createOrder: function (data: any, actions: any) {
              return actions.order.create({
                purchase_units: [{
                  amount: { value: orderData.amount },
                  description: orderData.description || `${orderData.tier} Plan`
                }]
              });
            },
            onApprove: function (data: any, actions: any) {
              return actions.order.capture().then(function (details: any) {
                console.log('PayPal payment completed:', details);
                if (onSuccess) {
                  onSuccess(details);
                }
              });
            },
            onError: function(err: any) {
              console.error('PayPal error:', err);
              if (onError) {
                onError(err);
              }
            },
            onCancel: function(data: any) {
              console.log('PayPal payment cancelled:', data);
              if (onCancel) {
                onCancel();
              }
            }
          }).render('#paypal-button-container');
        }
      };

      script.onerror = () => {
        console.error('Failed to load PayPal SDK');
        if (onError) {
          onError(new Error('Failed to load PayPal SDK'));
        }
      };

      document.head.appendChild(script);

      // Cleanup function
      return () => {
        const scriptToRemove = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [useRawHTML, orderData, onSuccess, onError, onCancel]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Secure Payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete your purchase with PayPal or Credit Card
        </p>
        <div className="bg-muted p-3 rounded-lg mt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold">
              ${orderData.amount} {orderData.currency}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <span className="text-sm capitalize">{orderData.tier}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Processing in USD via PayPal
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {useRawHTML ? (
          <div className="w-full">
            <div style={{ marginTop: '20px' }}>
              <div id="paypal-button-container" className="min-h-[50px]"></div>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Secure payment powered by PayPal
            </p>
          </div>
        ) : useNewButton ? (
          <PayPalButton
            amount={orderData.amount}
            onSuccess={onSuccess}
            onError={onError}
          />
        ) : useSmartButtons ? (
          <PayPalSmartButtons
            amount={orderData.amount}
            onSuccess={onSuccess}
            onError={onError}
          />
        ) : (
          <PayPalCheckout
            orderData={orderData}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
