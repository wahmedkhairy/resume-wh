
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PayPalCheckout from "./PayPalCheckout";
import { PayPalOrderData } from "@/services/paypalService";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: string;
  amount: number;
  currency: string;
  symbol: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  amount,
  currency,
  symbol
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("paypal");
  const [showPayPalButtons, setShowPayPalButtons] = useState(false);
  const { toast } = useToast();

  const paymentMethods = [
    {
      id: "paypal",
      name: "PayPal",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Pay with your PayPal account"
    }
  ];

  // Add Egyptian payment methods if currency is EGP
  if (currency === "EGP") {
    paymentMethods.push(
      {
        id: "fawry",
        name: "Fawry",
        icon: <Smartphone className="h-5 w-5" />,
        description: "Pay through Fawry network"
      },
      {
        id: "meeza",
        name: "Meeza",
        icon: <Building2 className="h-5 w-5" />,
        description: "Egyptian national payment network"
      }
    );
  }

  const handleProceedToPayment = () => {
    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    if (selectedMethod === "paypal") {
      setShowPayPalButtons(true);
    } else {
      // Handle local Egyptian payment methods (mock for now)
      toast({
        title: `Redirecting to ${selectedMethod}`,
        description: "You will be redirected to complete your payment.",
      });
      
      setTimeout(() => {
        toast({
          title: "Payment Successful!",
          description: `Your ${selectedTier} subscription has been activated.`,
        });
        onClose();
        window.location.href = "/payment-success";
      }, 2000);
    }
  };

  const handlePayPalSuccess = (details: any) => {
    toast({
      title: "Payment Successful!",
      description: `Your ${selectedTier} subscription has been activated.`,
    });
    onClose();
    window.location.href = "/payment-success";
  };

  const handlePayPalError = (error: any) => {
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
    setShowPayPalButtons(false);
  };

  const handlePayPalCancel = () => {
    setShowPayPalButtons(false);
  };

  const orderData: PayPalOrderData = {
    amount: amount.toString(),
    currency: currency,
    description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan Subscription`,
    tier: selectedTier
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold capitalize">{selectedTier} Plan</h3>
            <p className="text-2xl font-bold">{symbol}{amount}</p>
            <p className="text-sm text-muted-foreground">{currency}</p>
          </div>

          {!showPayPalButtons ? (
            <>
              <div className="space-y-3">
                <h4 className="font-medium">Select Payment Method:</h4>
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMethod === method.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        {method.icon}
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleProceedToPayment} 
                  disabled={!selectedMethod}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-center">Complete your payment with PayPal</h4>
              <PayPalCheckout
                orderData={orderData}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
                onCancel={handlePayPalCancel}
              />
              <Button variant="outline" onClick={handlePayPalCancel} className="w-full">
                Back to Payment Methods
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
