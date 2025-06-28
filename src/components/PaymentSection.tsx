
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayPalOrderData } from "@/services/paypalService";
import FixedPayPalButtons from "./FixedPayPalButtons";

interface PaymentSectionProps {
  orderData: PayPalOrderData;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
  useRawHTML?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('PaymentSection rendered with orderData:', orderData);

  const handlePayPalSuccess = (details: any) => {
    console.log('PaymentSection: PayPal payment successful:', details);
    setIsProcessing(true);
    onSuccess(details);
  };

  const handlePayPalError = (error: any) => {
    console.error('PaymentSection: PayPal payment error:', error);
    setIsProcessing(false);
    onError(error);
  };

  const handlePayPalCancel = () => {
    console.log('PaymentSection: PayPal payment cancelled');
    setIsProcessing(false);
    onCancel();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Complete Your Payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          {orderData.tier.charAt(0).toUpperCase() + orderData.tier.slice(1)} Plan - ${orderData.amount} USD
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PayPal Payment Option */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-center">Pay with PayPal</h3>
          <FixedPayPalButtons
            selectedTier={orderData.tier}
            onSuccess={handlePayPalSuccess}
            onError={handlePayPalError}
            onCancel={handlePayPalCancel}
          />
          {isProcessing && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              Processing your PayPal payment...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
