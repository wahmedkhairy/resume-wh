
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PayPalCheckout from "./PayPalCheckout";
import { PayPalOrderData } from "@/services/paypalService";

interface PaymentSectionProps {
  orderData: PayPalOrderData;
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
        <PayPalCheckout
          orderData={orderData}
          onSuccess={onSuccess}
          onError={onError}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
