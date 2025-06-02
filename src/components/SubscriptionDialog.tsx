
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SubscriptionTiers from "./SubscriptionTiers";
import PaymentModal from "./PaymentModal";

interface SubscriptionDialogProps {
  children: React.ReactNode;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [pricingInfo, setPricingInfo] = useState({
    basic: { amount: 2, currency: "USD", symbol: "$" },
    premium: { amount: 3, currency: "USD", symbol: "$" },
    unlimited: { amount: 9, currency: "USD", symbol: "$" }
  });

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code === 'EG') {
          setPricingInfo({
            basic: { amount: 39, currency: "EGP", symbol: "E£" },
            premium: { amount: 49, currency: "EGP", symbol: "E£" },
            unlimited: { amount: 99, currency: "EGP", symbol: "E£" }
          });
        }
      } catch (error) {
        console.error("Error detecting location:", error);
      }
    };
    
    detectLocation();
  }, []);

  const handleSubscriptionSelect = (tier: string) => {
    setSelectedTier(tier);
    setShowPaymentModal(true);
    setIsOpen(false);
  };

  const getCurrentPricing = () => {
    switch (selectedTier) {
      case "basic":
        return pricingInfo.basic;
      case "premium":
        return pricingInfo.premium;
      case "unlimited":
        return pricingInfo.unlimited;
      default:
        return pricingInfo.basic;
    }
  };

  const currentPricing = getCurrentPricing();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Choose Your Plan</DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
        amount={currentPricing.amount}
        currency={currentPricing.currency}
        symbol={currentPricing.symbol}
      />
    </>
  );
};

export default SubscriptionDialog;
