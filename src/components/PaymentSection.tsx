
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayPalOrderData } from "@/services/paypalService";
import CreditCardForm from "./CreditCardForm";
import { Separator } from "@/components/ui/separator";
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

        <div className="relative">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
          </div>
        </div>

        {/* Credit Card Payment Option */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-center">Pay with Credit Card</h3>
          <CreditCardForm
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
            amount={parseFloat(orderData.amount)}
            currency={orderData.currency}
            symbol={orderData.currency === 'EGP' ? 'EGP' : '$'}
            selectedTier={orderData.tier}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
