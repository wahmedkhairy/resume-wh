
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import PayPalCheckout from "./PayPalCheckout";
import { PayPalOrderData } from "@/services/paypalService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  amount: number;
  currency: string;
  symbol: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  amount,
  currency,
  symbol
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const orderData: PayPalOrderData = {
    amount: amount.toString(),
    currency: currency,
    description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan - Resume Export Credits`,
    tier: selectedTier
  };

  const handlePaymentSuccess = (details: any) => {
    setIsProcessing(false);
    toast({
      title: "Payment Successful!",
      description: `Your ${selectedTier} plan has been activated with export credits.`,
    });
    onClose();
    window.location.reload(); // Refresh to update subscription status
  };

  const handlePaymentError = (error: any) => {
    setIsProcessing(false);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    setIsProcessing(false);
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold capitalize">{selectedTier} Plan</h3>
            <p className="text-2xl font-bold">{symbol}{amount}</p>
            <p className="text-sm text-muted-foreground">One-time payment for export credits</p>
          </div>

          {/* PayPal Payment */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <h4 className="font-medium">Pay with PayPal or Credit Card</h4>
                <p className="text-sm text-muted-foreground">Secure payment processing</p>
              </div>
              
              <PayPalCheckout
                orderData={orderData}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </CardContent>
          </Card>

          {/* Cancel Button */}
          <Button variant="outline" onClick={onClose} className="w-full" disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
