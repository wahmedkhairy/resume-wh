
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PayPalIntegration from "./PayPalIntegration";

interface PaymentSectionProps {
  orderData: {
    amount: string;
    currency: string;
    description: string;
    tier: string;
  };
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayPalSuccess = useCallback((details: any) => {
    console.log('Payment successful:', details);
    setIsProcessing(true);
    setPaymentError(null);
    onSuccess(details);
  }, [onSuccess]);

  const handlePayPalError = useCallback((error: any) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
    setPaymentError(error.message || 'Payment failed. Please try again.');
    onError(error);
  }, [onError]);

  const handlePayPalCancel = useCallback(() => {
    console.log('Payment cancelled');
    setIsProcessing(false);
    setPaymentError(null);
    onCancel();
  }, [onCancel]);

  const handleRetry = useCallback(() => {
    setPaymentError(null);
    setIsProcessing(false);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Complete Your Payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          {orderData.tier.charAt(0).toUpperCase() + orderData.tier.slice(1)} Plan - ${orderData.amount} USD
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3 text-center">Pay with PayPal</h3>
          
          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 mb-2">{paymentError}</p>
              <button
                onClick={handleRetry}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}
          
          <div className="paypal-container">
            {!isProcessing && !paymentError && (
              <PayPalIntegration
                amount={orderData.amount}
                tier={orderData.tier as 'basic' | 'premium' | 'unlimited'}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
              />
            )}
            
            {isProcessing && (
              <div className="text-center text-sm text-muted-foreground p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                Processing your payment...
                <p className="mt-2 text-xs">Please don't close this window</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;