
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

  const handlePayPalSuccess = (details: any) => {
    console.log('PayPal payment successful:', details);
    setIsProcessing(true);
    onSuccess(details);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment error:', error);
    setIsProcessing(false);
    onError(error);
  };

  const handlePayPalCancel = () => {
    console.log('PayPal payment cancelled');
    setIsProcessing(false);
    onCancel();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Complete Your Payment</CardTitle>
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
