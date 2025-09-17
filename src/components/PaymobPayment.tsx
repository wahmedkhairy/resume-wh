import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  createPaymobOrder, 
  checkPaymentStatus, 
  processSuccessfulPayment, 
  getUserProfile,
  PaymobOrderData 
} from "@/services/paymobService";
import { CreditCard, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymobPaymentProps {
  orderData: Omit<PaymobOrderData, 'customerEmail' | 'customerName'>;
  userId: string;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const PaymobPayment: React.FC<PaymobPaymentProps> = ({
  orderData,
  userId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating' | 'waiting' | 'verifying'>('idle');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const paymentWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      const profile = await getUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
      } else {
        toast({
          title: "Error",
          description: "Unable to load user profile. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    if (userId) {
      loadUserProfile();
    }
  }, [userId, toast]);

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

  // Enhanced payment status checking with better error handling
  const startPaymentStatusCheck = (orderId: string) => {
    let checkCount = 0;
    const maxChecks = 60; // Check for 5 minutes (every 5 seconds)

    checkIntervalRef.current = setInterval(async () => {
      checkCount++;

      try {
        // Check if payment window is closed
        if (paymentWindowRef.current?.closed) {
          console.log('Payment window closed, performing final verification');
          cleanup();
          setPaymentStatus('verifying');
          
          // Give a moment for webhook to process, then check
          setTimeout(async () => {
            const statusResult = await checkPaymentStatus(orderId);
            if (statusResult.success && statusResult.status === 'completed') {
              toast({
                title: "Payment Completed",
                description: "Your payment has been processed successfully!",
              });
              setIsProcessing(false);
              setPaymentStatus('idle');
              onSuccess(statusResult.transactionId || orderId);
              return;
            }
            
            // If not completed, show uncertain status
            setIsProcessing(false);
            setPaymentStatus('idle');
            toast({
              title: "Payment Status Uncertain",
              description: "Please check your email for payment confirmation or contact support.",
            });
          }, 3000);
          return;
        }

        // Check payment status periodically
        if (checkCount % 6 === 0) { // Check every 30 seconds
          const statusResult = await checkPaymentStatus(orderId);
          if (statusResult.success && statusResult.status === 'completed') {
            cleanup();
            setIsProcessing(false);
            setPaymentStatus('idle');
            toast({
              title: "Payment Completed",
              description: "Your payment has been processed successfully!",
            });
            onSuccess(statusResult.transactionId || orderId);
            return;
          } else if (statusResult.success && statusResult.status === 'failed') {
            cleanup();
            setIsProcessing(false);
            setPaymentStatus('idle');
            toast({
              title: "Payment Failed",
              description: "Your payment was not successful. Please try again.",
              variant: "destructive",
            });
            onError("Payment failed");
            return;
          }
        }

        // Stop checking after max attempts
        if (checkCount >= maxChecks) {
          cleanup();
          setIsProcessing(false);
          setPaymentStatus('idle');
          toast({
            title: "Payment Verification Timeout",
            description: "Unable to verify payment status. Please contact support if payment was completed.",
            variant: "destructive",
          });
          onError("Payment verification timeout");
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds

    // Set absolute timeout for 15 minutes
    timeoutRef.current = setTimeout(() => {
      cleanup();
      setIsProcessing(false);
      setPaymentStatus('idle');
      toast({
        title: "Payment Session Expired",
        description: "Payment session has expired. Please try again.",
        variant: "destructive",
      });
      onError("Payment session expired");
    }, 900000); // 15 minutes
  };

  const handlePayment = async () => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "User profile not loaded. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('creating');
    
    try {
      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentOrderId(orderId);

      // Prepare order data with user information
      const completeOrderData: PaymobOrderData = {
        ...orderData,
        orderId,
        customerEmail: userProfile.email,
        customerName: userProfile.full_name || 'User',
        userId
      };

      console.log('Creating Paymob payment with data:', {
        ...completeOrderData,
        customerEmail: completeOrderData.customerEmail.substring(0, 3) + '***'
      });

      const result = await createPaymobOrder(completeOrderData);
      
      if (result.success && result.paymentUrl) {
        setPaymentStatus('waiting');
        
        // Calculate center position for popup
        const width = 600;
        const height = 700;
        const left = Math.max(0, (window.screen.width / 2) - (width / 2));
        const top = Math.max(0, (window.screen.height / 2) - (height / 2));

        // Open Paymob payment page in new window
        paymentWindowRef.current = window.open(
          result.paymentUrl,
          'paymob-payment',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`
        );

        if (!paymentWindowRef.current) {
          throw new Error('Unable to open payment window. Please check your popup blocker settings.');
        }

        // Focus on the payment window
        paymentWindowRef.current.focus();

        // Start monitoring payment status
        startPaymentStatusCheck(orderId);

        toast({
          title: "Payment Window Opened",
          description: "Complete your payment in the popup window.",
        });

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
      setPaymentStatus('idle');
      setCurrentOrderId(null);
    }
  };

  const handleCancel = () => {
    cleanup();
    setIsProcessing(false);
    setPaymentStatus('idle');
    setCurrentOrderId(null);
    onCancel();
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'creating':
        return 'Creating payment order...';
      case 'waiting':
        return 'Complete your payment in the popup window';
      case 'verifying':
        return 'Verifying payment status...';
      default:
        return 'Ready to process payment';
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'creating':
      case 'verifying':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'waiting':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Paymob Payment (Egypt)
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
          {userProfile && (
            <p className="text-xs text-muted-foreground mt-2">
              Payment for: {userProfile.email}
            </p>
          )}
        </div>

        {isProcessing && (
          <Alert>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <AlertDescription>
                {getStatusMessage()}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {paymentStatus === 'waiting' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Payment window is open. Please:</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Complete your payment in the popup window</li>
                  <li>• Don't close this page until payment is complete</li>
                  <li>• Check your popup blocker if window didn't open</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {currentOrderId && (
          <div className="text-xs text-muted-foreground text-center">
            Order ID: {currentOrderId}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            disabled={isProcessing && paymentStatus === 'verifying'}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            className="flex-1"
            disabled={isProcessing || !userProfile}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {paymentStatus === 'creating' ? 'Creating...' : 
                 paymentStatus === 'verifying' ? 'Verifying...' : 'Processing...'}
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </div>

        {!userProfile && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Loading user profile... Please wait.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
