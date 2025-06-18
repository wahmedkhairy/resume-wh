
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTiers from "./SubscriptionTiers";
import PaymentModal from "./PaymentModal";
import LivePaymentModal from "./LivePaymentModal";
import LivePayPalConfig from "./LivePayPalConfig";

interface SubscriptionDialogProps {
  children: React.ReactNode;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLivePaymentModal, setShowLivePaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [hasLiveConfig, setHasLiveConfig] = useState(false);

  useEffect(() => {
    // Simple config check
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    setHasLiveConfig(!!savedClientId);
    console.log('SubscriptionDialog: Config loaded', { hasLiveConfig: !!savedClientId });
  }, []);

  const handleSubscriptionSelect = (tier: string) => {
    console.log('SubscriptionDialog: Subscription selected', { tier, hasLiveConfig });
    
    setSelectedTier(tier);
    setIsOpen(false);
    
    // Simple delay to ensure dialog closes
    setTimeout(() => {
      if (hasLiveConfig) {
        setShowLivePaymentModal(true);
      } else {
        setShowPaymentModal(true);
      }
    }, 200);
  };

  const handleClientIdSaved = () => {
    setHasLiveConfig(true);
    console.log('SubscriptionDialog: PayPal config updated');
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
              {hasLiveConfig ? "Live PayPal Payments" : "Choose Your Plan"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {hasLiveConfig 
                ? "Live PayPal payments in USD - Real transactions will be processed"
                : "Select the plan that best fits your resume export needs."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6">
            {hasLiveConfig ? (
              <Tabs defaultValue="plans" className="w-full">
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
              <div className="space-y-6">
                <div className="text-center bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Demo Mode</h3>
                  <p className="text-sm text-yellow-700">
                    Currently using demo payments. Configure live PayPal in Admin settings for real transactions.
                  </p>
                </div>
                <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
              </div>
            )}
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

      {showLivePaymentModal && (
        <LivePaymentModal 
          isOpen={showLivePaymentModal}
          onClose={() => {
            setShowLivePaymentModal(false);
            setSelectedTier("");
          }}
          selectedTier={selectedTier}
        />
      )}
    </>
  );
};

export default SubscriptionDialog;
