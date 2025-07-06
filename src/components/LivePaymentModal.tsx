
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LivePayPalCheckout from "./LivePayPalCheckout";
import { getPayPalPricing, formatPayPalPrice } from "@/utils/paypalCurrencyUtils";

interface LivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
}

const LivePaymentModal: React.FC<LivePaymentModalProps> = ({
  isOpen,
  onClose,
  selectedTier
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveClientId, setLiveClientId] = useState("");
  const { toast } = useToast();

  const paypalPricing = getPayPalPricing();

  useEffect(() => {
    // Load live client ID from localStorage
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    if (savedClientId) {
      setLiveClientId(savedClientId);
    }
  }, [isOpen]);

  const getAmount = () => {
    switch (selectedTier) {
      case 'basic':
        return paypalPricing.basicPrice;
      case 'premium':
        return paypalPricing.premiumPrice;
      case 'unlimited':
        return paypalPricing.unlimitedPrice;
      default:
        return paypalPricing.basicPrice;
    }
  };

  const getExports = () => {
    switch (selectedTier) {
      case 'basic':
        return 2;
      case 'premium':
        return 6;
      case 'unlimited':
        return 999;
      default:
        return 2;
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    console.log('Live payment successful:', details);
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to complete your purchase.",
        });
        window.location.href = `/auth?returnTo=${encodeURIComponent(`/payment-success?session_id=${details.id || 'completed'}`)}`;
        return;
      }

      const scanCount = getExports();
      
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
      window.location.href = `/payment-success?session_id=${details.id || 'completed'}&tier=${selectedTier}&amount=${getAmount()}`;
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
    console.error('Live payment error:', error);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    console.log('Live payment cancelled');
    onClose();
    window.location.href = '/payment-cancelled';
  };

  if (!liveClientId) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>PayPal Configuration Required</DialogTitle>
            <DialogDescription>
              Please configure your live PayPal Client ID in the settings before making payments.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center p-6">
            <p className="text-muted-foreground mb-4">
              Go to Settings → PayPal to configure your live credentials.
            </p>
            <button 
              onClick={onClose}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const amount = getAmount();
  const orderData = {
    amount: amount.toString(),
    currency: "USD",
    description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan - ${getExports() === 999 ? 'Unlimited' : getExports()} exports`,
    tier: selectedTier
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="mt-6 space-y-4">
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold text-lg mb-2">
              {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan
            </h3>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatPayPalPrice(amount)} USD
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              One-time payment • {getExports() === 999 ? 'Unlimited' : getExports()} resume exports
            </p>
            <ul className="text-sm space-y-1">
              <li>• AI-powered resume optimization</li>
              <li>• ATS-friendly templates</li>
              <li>• Multiple export formats</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <LivePayPalCheckout
            orderData={orderData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
            liveClientId={liveClientId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LivePaymentModal;
