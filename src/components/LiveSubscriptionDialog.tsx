
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
        <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
              Select a subscription plan to unlock premium features. All prices are in USD.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6">
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                  Choose Plan
                </TabsTrigger>
                <TabsTrigger value="setup" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
                  PayPal Setup
                </TabsTrigger>
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
