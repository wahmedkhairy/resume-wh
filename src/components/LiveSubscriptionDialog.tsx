
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

  const openDialog = () => {
    console.log('Opening subscription dialog');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    console.log('Closing subscription dialog');
    setIsDialogOpen(false);
  };

  return (
    <>
      <div onClick={openDialog}>
        {children}
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={closeDialog}
          />
          
          {/* Dialog Content */}
          <div className="relative z-60 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                  <p className="text-muted-foreground mt-1">
                    Select a subscription plan to unlock premium features. All prices are in USD.
                  </p>
                </div>
                <button
                  onClick={closeDialog}
                  className="ml-4 text-gray-400 hover:text-gray-600 text-xl font-semibold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
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
          </div>
        </div>
      )}

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
