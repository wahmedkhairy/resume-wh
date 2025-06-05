
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h4 className="font-medium">Pay with PayPal or Credit Card</h4>
          <p className="text-sm text-muted-foreground">Secure payment processing</p>
        </div>
        
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
