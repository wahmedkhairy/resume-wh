
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-2xl font-bold text-center">Choose Your Plan</DialogTitle>
            <DialogDescription className="text-center mt-2">
              Select a subscription plan to unlock premium features. All prices are in USD.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-6">
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="plans">Choose Plan</TabsTrigger>
                <TabsTrigger value="setup">PayPal Setup</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plans">
                <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />
              </TabsContent>
              
              <TabsContent value="setup">
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
