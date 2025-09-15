import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPaymobOrder, verifyPaymobPayment, PaymobOrderData } from "@/services/paymobService";
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
  const paymentWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
      paymentWindowRef.current.close();
      paymentWindowRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, []);

  const handlePaymentWindowMessage = async (event: MessageEvent) => {
    // Only accept messages from Paymob domain
    if (!event.origin.includes('paymob.com') && !event.origin.includes('accept.paymob.com')) {
      return;
    }

    const { type, transactionId, success, error } = event.data;

    if (type === 'payment_completed') {
      cleanup();
      setIsProcessing(false);

      if (success && transactionId) {
        // Verify the payment with backend
        const isVerified = await verifyPaymobPayment(transactionId);
        if (isVerified) {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully!",
          });
          onSuccess(transactionId);
        } else {
          toast({
            title: "Payment Verification Failed",
            description: "Please contact support for assistance.",
            variant: "destructive",
          });
          onError("Payment verification failed");
        }
      } else {
        toast({
          title: "Payment Failed",
          description: error || "Payment was not completed successfully.",
          variant: "destructive",
        });
        onError(error || "Payment failed");
      }
    }
  };

  const startPaymentStatusCheck = (orderId: string) => {
    let checkCount = 0;
    const maxChecks = 60; // Check for 5 minutes (every 5 seconds)

    checkIntervalRef.current = setInterval(async () => {
      checkCount++;

      // Check if payment window is closed
      if (paymentWindowRef.current?.closed) {
        cleanup();
        setIsProcessing(false);
        
        // Try to verify payment one last time when window closes
        try {
          const isVerified = await verifyPaymobPayment(orderId);
          if (isVerified) {
            toast({
              title: "Payment Completed",
              description: "Your payment has been processed successfully!",
            });
            onSuccess(orderId);
            return;
          }
        } catch (error) {
          console.error('Final verification error:', error);
        }

        toast({
          title: "Payment Window Closed",
          description: "Payment status is uncertain. Please check your email for confirmation.",
        });
        return;
      }

      // Stop checking after max attempts
      if (checkCount >= maxChecks) {
        cleanup();
        setIsProcessing(false);
        toast({
          title: "Payment Timeout",
          description: "Payment verification timed out. Please contact support if payment was completed.",
          variant: "destructive",
        });
        onError("Payment verification timeout");
      }
    }, 5000); // Check every 5 seconds

    // Set absolute timeout for 15 minutes
    timeoutRef.current = setTimeout(() => {
      cleanup();
      setIsProcessing(false);
      toast({
        title: "Payment Session Expired",
        description: "Payment session has expired. Please try again.",
        variant: "destructive",
      });
      onError("Payment session expired");
    }, 900000); // 15 minutes
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await createPaymobOrder(orderData);
      
      if (result.success && result.paymentUrl) {
        // Add message listener for payment completion
        window.addEventListener('message', handlePaymentWindowMessage);
        
        // Calculate center position for popup
        const width = 600;
        const height = 700;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);

        // Open Paymob payment page in new window
        paymentWindowRef.current = window.open(
          result.paymentUrl,
          'paymob-payment',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
        );

        if (!paymentWindowRef.current) {
          throw new Error('Unable to open payment window. Please check your popup blocker.');
        }

        // Focus on the payment window
        paymentWindowRef.current.focus();

        // Start monitoring payment status
        startPaymentStatusCheck(result.orderId || orderData.orderId);

      } else {
        throw new Error(result.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    cleanup();
    setIsProcessing(false);
    onCancel();
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
            You will be redirected to Paymob to complete your payment securely
          </p>
          <p className="text-2xl font-bold">
            {orderData.currency === 'EGP' ? 'E£' : '$'}{orderData.amount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground capitalize">
            {orderData.tier} Plan
          </p>
        </div>

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, []);
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700 text-center">
              Payment window is open. Complete your payment in the popup window.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
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
