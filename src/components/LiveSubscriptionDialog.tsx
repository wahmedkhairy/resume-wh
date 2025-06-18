
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
      // Stay in dialog and show config tab
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
            <DialogTitle className="text-2xl text-center">Live PayPal Payments</DialogTitle>
            <DialogDescription className="text-center">
              Configure your live PayPal credentials and choose your plan. All prices are in USD.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={hasLiveConfig ? "plans" : "config"} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="config">PayPal Setup</TabsTrigger>
              <TabsTrigger value="plans" disabled={!hasLiveConfig}>
                Choose Plan {!hasLiveConfig && "(Setup Required)"}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="mt-6">
              <LivePayPalConfig onClientIdSaved={handleClientIdSaved} />
            </TabsContent>
            
            <TabsContent value="plans" className="mt-6">
              {hasLiveConfig ? (
                <div className="space-y-4">
                  <div className="text-center bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Live PayPal Ready</h3>
                    <p className="text-sm text-green-700">
                      Your live PayPal configuration is active. All payments will be processed in USD.
                    </p>
                  </div>
                  <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">
                    Please configure your live PayPal Client ID first.
                  </p>
                </div>
              )}
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
