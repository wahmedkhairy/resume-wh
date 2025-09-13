import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPaymobOrder, PaymobOrderData } from "@/services/paymobService";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymobPaymentProps {
  orderData: PaymobOrderData;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PaymobPayment: React.FC<PaymobPaymentProps> = ({
  orderData,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await createPaymobOrder(orderData);
      
      if (result.success && result.paymentUrl) {
        // Open Paymob payment page in new window
        const paymentWindow = window.open(
          result.paymentUrl,
          'paymob-payment',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        );

        // Listen for payment completion
        const checkPaymentStatus = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkPaymentStatus);
            // Handle payment completion - you may want to verify the payment status
            toast({
              title: "Payment window closed",
              description: "Please verify your payment status.",
            });
            setIsProcessing(false);
          }
        }, 1000);

        // Set a timeout to stop checking after 10 minutes
        setTimeout(() => {
          clearInterval(checkPaymentStatus);
          if (paymentWindow && !paymentWindow.closed) {
            paymentWindow.close();
          }
          setIsProcessing(false);
        }, 600000); // 10 minutes

      } else {
        throw new Error(result.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paymob Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            You will be redirected to Paymob to complete your payment
          </p>
          <p className="text-2xl font-bold">
            {orderData.currency === 'EGP' ? 'E£' : '$'}{orderData.amount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {orderData.tier} Plan
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};