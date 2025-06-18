
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import EnhancedSubscriptionTiers from "./EnhancedSubscriptionTiers";
import PaymentModal from "./PaymentModal";
import { getPayPalPricing } from "@/utils/paypalCurrencyUtils";

interface SubscriptionDialogProps {
  children: React.ReactNode;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");

  const handleSubscriptionSelect = (tier: string) => {
    console.log('SubscriptionDialog: Subscription selected', { tier });
    
    setSelectedTier(tier);
    setIsOpen(false);
    
    // Show payment modal after dialog closes
    setTimeout(() => {
      setShowPaymentModal(true);
    }, 200);
  };

  const getCurrentPricing = () => {
    const pricing = {
      basic: { amount: 2, currency: "USD", symbol: "$" },
      premium: { amount: 3, currency: "USD", symbol: "$" },
      unlimited: { amount: 4.99, currency: "USD", symbol: "$" }
    };

    return pricing[selectedTier as keyof typeof pricing] || pricing.basic;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-center">
              Select the plan that best fits your resume export needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6">
            <EnhancedSubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
          </div>
        </DialogContent>
      </Dialog>

      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTier("");
          }}
          selectedTier={selectedTier}
          amount={getCurrentPricing().amount}
          currency={getCurrentPricing().currency}
          symbol={getCurrentPricing().symbol}
        />
      )}
    </>
  );
};

export default SubscriptionDialog;
