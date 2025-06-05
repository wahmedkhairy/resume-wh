
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import OrderSummary from "./OrderSummary";
import PaymentSection from "./PaymentSection";
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
          <DialogDescription>
            Secure payment processing for your {selectedTier} plan with {
              selectedTier === 'basic' ? '2' : 
              selectedTier === 'premium' ? '6' : 
              'unlimited'
            } resume exports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <OrderSummary
            selectedTier={selectedTier}
            amount={amount}
            symbol={symbol}
          />

          <PaymentSection
            orderData={orderData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />

          <Button variant="outline" onClick={onClose} className="w-full" disabled={isProcessing}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
