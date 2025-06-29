
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

  const handlePayPalSuccess = useCallback((details: any) => {
    console.log('Payment successful:', details);
    setIsProcessing(true);
    onSuccess(details);
  }, [onSuccess]);

  const handlePayPalError = useCallback((error: any) => {
    console.error('Payment error:', error);
    setIsProcessing(false);
    onError(error);
  }, [onError]);

  const handlePayPalCancel = useCallback(() => {
    console.log('Payment cancelled');
    setIsProcessing(false);
    onCancel();
  }, [onCancel]);

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
          <div className="paypal-container">
            <PayPalIntegration
              amount={orderData.amount}
              tier={orderData.tier}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={handlePayPalCancel}
            />
          </div>
          {isProcessing && (
            <div className="text-center text-sm text-muted-foreground mt-4">
              Processing your payment...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
