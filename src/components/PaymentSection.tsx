
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayPalOrderData } from "@/services/paypalService";
import SimplePayPalButtons from "./SimplePayPalButtons";

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
    onSuccess(details);
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal payment error:', error);
    onError(error);
  };

  const handlePayPalCancel = () => {
    console.log('PayPal payment cancelled');
    onCancel();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">Complete Your Payment</CardTitle>
        <div className="bg-muted p-3 rounded-lg mt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span className="text-lg font-bold">
              {orderData.currency === 'EGP' ? 'EGP' : '$'} {orderData.amount}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <span className="text-sm capitalize">{orderData.tier}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PayPal Payment Option */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-center">Pay with PayPal</h3>
          <SimplePayPalButtons
            amount={orderData.amount}
            currency={orderData.currency}
            tier={orderData.tier}
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
