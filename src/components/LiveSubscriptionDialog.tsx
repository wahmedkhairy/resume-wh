
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTiers from "./SubscriptionTiers";
import LivePaymentModal from "./LivePaymentModal";
import LivePayPalConfig from "./LivePayPalConfig";

interface LiveSubscriptionDialogProps {
  children: React.ReactNode;
}

const LiveSubscriptionDialog: React.FC<LiveSubscriptionDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState("");

  const handleSubscriptionSelect = (tier: string) => {
    console.log('LiveSubscriptionDialog: Plan selected', { tier });
    
    // Check if PayPal is configured
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    if (!savedClientId) {
      alert('Please configure your PayPal credentials in the PayPal Setup tab before proceeding with payment.');
      return;
    }
    
    // Proceed with payment
    setSelectedTier(tier);
    setShowPaymentModal(true);
    setIsOpen(false);
  };

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
          
          <div className="mt-6">
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="plans">Choose Plan</TabsTrigger>
                <TabsTrigger value="setup">PayPal Setup</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plans" className="mt-6">
                <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
              </TabsContent>
              
              <TabsContent value="setup" className="mt-6">
                <LivePayPalConfig />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {showPaymentModal && (
        <LivePaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedTier={selectedTier}
        />
      )}
    </>
  );
};

export default LiveSubscriptionDialog;
