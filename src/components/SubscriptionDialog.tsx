
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize on mount, not when dialog opens
  useEffect(() => {
    initializeComponent();
  }, []);

  // Listen for PayPal config updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('SubscriptionDialog: PayPal config updated, reinitializing');
      initializeComponent();
    };

    window.addEventListener('paypal-config-updated', handleConfigUpdate);
    return () => window.removeEventListener('paypal-config-updated', handleConfigUpdate);
  }, []);

  const initializeComponent = () => {
    console.log('SubscriptionDialog: Initializing component');
    try {
      const savedClientId = localStorage.getItem('paypal_live_client_id');
      const hasConfig = !!savedClientId;
      setHasLiveConfig(hasConfig);
      setIsInitialized(true);
      console.log('SubscriptionDialog: Initialization complete', { hasLiveConfig: hasConfig });
    } catch (error) {
      console.error('SubscriptionDialog: Error during initialization', error);
      setIsInitialized(true); // Still mark as initialized to prevent loading loop
    }
  };

  const handleSubscriptionSelect = (tier: string) => {
    console.log('SubscriptionDialog: Subscription selected', { tier, hasLiveConfig });
    
    setSelectedTier(tier);
    setIsOpen(false); // Close dialog first
    
    // Small delay to ensure dialog closes before opening payment modal
    setTimeout(() => {
      if (hasLiveConfig) {
        console.log('SubscriptionDialog: Opening live payment modal');
        setShowLivePaymentModal(true);
      } else {
        console.log('SubscriptionDialog: Opening demo payment modal');
        setShowPaymentModal(true);
      }
    }, 100);
  };

  const handleClientIdSaved = (clientId: string) => {
    console.log('SubscriptionDialog: Client ID saved, updating config');
    setHasLiveConfig(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    console.log('SubscriptionDialog: Dialog open state changed', { open });
    setIsOpen(open);
    
    // Reset any error states when dialog closes
    if (!open) {
      setSelectedTier("");
    }
  };

  const getCurrentPricing = () => {
    // Use simple default pricing to avoid async loading issues
    const defaultPricing = {
      basic: { amount: 2, currency: "USD", symbol: "$" },
      premium: { amount: 3, currency: "USD", symbol: "$" },
      unlimited: { amount: 4.99, currency: "USD", symbol: "$" }
    };

    switch (selectedTier) {
      case "basic":
        return defaultPricing.basic;
      case "premium":
        return defaultPricing.premium;
      case "unlimited":
        return defaultPricing.unlimited;
      default:
        return defaultPricing.basic;
    }
  };

  const currentPricing = getCurrentPricing();

  if (!isInitialized) {
    return (
      <div className="inline-block">
        {children}
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
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
      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedTier={selectedTier}
          amount={currentPricing.amount}
          currency={currentPricing.currency}
          symbol={currentPricing.symbol}
        />
      )}

      {/* Live Payment Modal */}
      {showLivePaymentModal && (
        <LivePaymentModal 
          isOpen={showLivePaymentModal}
          onClose={() => setShowLivePaymentModal(false)}
          selectedTier={selectedTier}
        />
      )}
    </>
  );
};

export default SubscriptionDialog;
