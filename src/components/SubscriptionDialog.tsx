import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTiers from "./SubscriptionTiers";
import PaymentModal from "./PaymentModal";
import LivePaymentModal from "./LivePaymentModal";
import LivePayPalConfig from "./LivePayPalConfig";
import { detectUserLocation } from "@/utils/currencyUtils";

interface SubscriptionDialogProps {
  children: React.ReactNode;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLivePaymentModal, setShowLivePaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [hasLiveConfig, setHasLiveConfig] = useState(false);
  const [pricingInfo, setPricingInfo] = useState({
    basic: { amount: 2, currency: "USD", symbol: "$" },
    premium: { amount: 3, currency: "USD", symbol: "$" },
    unlimited: { amount: 9.9, currency: "USD", symbol: "$" }
  });

  useEffect(() => {
    if (isOpen) {
      checkLiveConfig();
      loadPricingInfo();
    }
  }, [isOpen]);

  const checkLiveConfig = () => {
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    setHasLiveConfig(!!savedClientId);
  };

  const loadPricingInfo = async () => {
    try {
      // Check if live PayPal is configured
      const savedClientId = localStorage.getItem('paypal_live_client_id');
      
      if (savedClientId) {
        // Use USD pricing for live PayPal
        setPricingInfo({
          basic: { amount: 2, currency: "USD", symbol: "$" },
          premium: { amount: 3, currency: "USD", symbol: "$" },
          unlimited: { amount: 4.99, currency: "USD", symbol: "$" }
        });
      } else {
        // Use location-based pricing for demo mode
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
      }
      console.log('SubscriptionDialog: Pricing info loaded', { hasLiveConfig, pricingInfo });
    } catch (error) {
      console.error("SubscriptionDialog: Error loading pricing info:", error);
      // Keep default USD pricing on error
    }
  };

  const handleSubscriptionSelect = (tier: string) => {
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    
    if (savedClientId) {
      // Use live PayPal payment
      setSelectedTier(tier);
      setShowLivePaymentModal(true);
      setIsOpen(false);
    } else {
      // Use demo payment
      setSelectedTier(tier);
      setShowPaymentModal(true);
      setIsOpen(false);
    }
  };

  const handleClientIdSaved = (clientId: string) => {
    setHasLiveConfig(true);
    loadPricingInfo(); // Reload pricing when config changes
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
            <DialogTitle className="text-2xl text-center">
              {hasLiveConfig ? "Live PayPal Payments" : "Choose Your Plan"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {hasLiveConfig 
                ? "Live PayPal payments in USD - Real transactions will be processed"
                : "Select the plan that best fits your resume export needs. All plans include AI-powered optimization and ATS-friendly templates."
              }
            </DialogDescription>
          </DialogHeader>
          
          {hasLiveConfig ? (
            <Tabs defaultValue="plans" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plans">Choose Plan</TabsTrigger>
                <TabsTrigger value="config">PayPal Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plans" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Live PayPal Active</h3>
                    <p className="text-sm text-green-700">
                      Real payments will be processed in USD using your live PayPal credentials.
                    </p>
                  </div>
                  <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
                </div>
              </TabsContent>
              
              <TabsContent value="config" className="mt-6">
                <LivePayPalConfig onClientIdSaved={handleClientIdSaved} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="mt-6">
              <div className="text-center bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Demo Mode</h3>
                <p className="text-sm text-yellow-700">
                  Currently using demo payments. Configure live PayPal in Admin settings for real transactions.
                </p>
              </div>
              <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Demo Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
        amount={currentPricing.amount}
        currency={currentPricing.currency}
        symbol={currentPricing.symbol}
      />

      {/* Live Payment Modal */}
      <LivePaymentModal 
        isOpen={showLivePaymentModal}
        onClose={() => setShowLivePaymentModal(false)}
        selectedTier={selectedTier}
      />
    </>
  );
};

export default SubscriptionDialog;
