
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTiers from "./SubscriptionTiers";
import LivePaymentModal from "./LivePaymentModal";
import LivePayPalConfig from "./LivePayPalConfig";
import { getPayPalPricing } from "@/utils/paypalCurrencyUtils";

interface LiveSubscriptionDialogProps {
  children: React.ReactNode;
}

const LiveSubscriptionDialog: React.FC<LiveSubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");
  const [hasLiveConfig, setHasLiveConfig] = useState(false);

  useEffect(() => {
    // Check if live PayPal config exists
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    setHasLiveConfig(!!savedClientId);
  }, [isOpen]);

  const handleSubscriptionSelect = (tier: string) => {
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    if (!savedClientId) {
      // If no PayPal config, show alert and switch to config tab
      alert('Please configure your PayPal credentials first to proceed with payment.');
      return;
    }
    
    setSelectedTier(tier);
    setShowPaymentModal(true);
    setIsOpen(false);
  };

  const handleClientIdSaved = (clientId: string) => {
    setHasLiveConfig(true);
  };

  const paypalPricing = getPayPalPricing();

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
              Select a subscription plan to unlock premium features. All prices are in USD.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="plans" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plans">Choose Plan</TabsTrigger>
              <TabsTrigger value="config">PayPal Setup</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plans" className="mt-6">
              <div className="space-y-4">
                {!hasLiveConfig && (
                  <div className="text-center bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ PayPal Setup Required</h3>
                    <p className="text-sm text-yellow-700">
                      You'll need to configure your PayPal credentials before making a payment. 
                      You can set this up in the PayPal Setup tab.
                    </p>
                  </div>
                )}
                <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
              </div>
            </TabsContent>
            
            <TabsContent value="config" className="mt-6">
              <LivePayPalConfig onClientIdSaved={handleClientIdSaved} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <LivePaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedTier={selectedTier}
      />
    </>
  );
};

export default LiveSubscriptionDialog;
