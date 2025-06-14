
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

  const handlePaymentSuccess = async (details: any) => {
    console.log('Payment successful:', details);
    setIsProcessing(true);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not authenticated, redirect to auth page with return URL
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete your purchase.",
        });
        window.location.href = `/auth?returnTo=${encodeURIComponent(`/payment-success?session_id=${details.id || 'completed'}`)}`;
        return;
      }

      // Update subscription in database
      const scanCount = selectedTier === 'basic' ? 2 : 
                       selectedTier === 'premium' ? 6 : 999;
      
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: selectedTier,
          status: 'active',
          scan_count: scanCount,
          max_scans: scanCount,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast({
        title: "Payment Successful!",
        description: `Your ${selectedTier} plan has been activated with ${scanCount === 999 ? 'unlimited' : scanCount} export credits.`,
      });
      
      onClose();
      
      // Redirect to success page
      window.location.href = `/payment-success?session_id=${details.id || 'completed'}`;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Payment Processed, but...",
        description: "Payment was successful but there was an issue updating your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled. No charges were made.",
    });
    onClose();
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
          <OrderSummary selectedTier={selectedTier} />

          <PaymentSection
            orderData={orderData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />

          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Processing your subscription...</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
