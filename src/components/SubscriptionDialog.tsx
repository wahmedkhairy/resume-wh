import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SubscriptionTiers from "./SubscriptionTiers";
import PaymentModal from "./PaymentModal";
import { detectUserLocation } from "@/utils/currencyUtils";

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
    unlimited: { amount: 9.9, currency: "USD", symbol: "$" }
  });

  useEffect(() => {
    const loadPricingInfo = async () => {
      try {
        const locationData = await detectUserLocation();
        setPricingInfo({
          basic: { 
            amount: locationData.currency.basicPrice, 
            currency: locationData.currency.code, 
            symbol: locationData.currency.symbol 
          },
          premium: { 
            amount: locationData.currency.premiumPrice, 
            currency: locationData.currency.code, 
            symbol: locationData.currency.symbol 
          },
          unlimited: { 
            amount: locationData.currency.unlimitedPrice, 
            currency: locationData.currency.code, 
            symbol: locationData.currency.symbol 
          }
        });
        console.log('SubscriptionDialog: Pricing info loaded', locationData);
      } catch (error) {
        console.error("SubscriptionDialog: Error loading pricing info:", error);
        // Keep default USD pricing on error
      }
    };
    
    loadPricingInfo();
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
            <DialogDescription className="text-center">
              Select the plan that best fits your resume export needs. All plans include AI-powered optimization and ATS-friendly templates.
            </DialogDescription>
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
