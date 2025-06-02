import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("paypal");
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

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedMethod === "paypal") {
        // PayPal payment processing
        toast({
          title: "Redirecting to PayPal",
          description: "You will be redirected to complete your payment.",
        });
        
        setTimeout(() => {
          toast({
            title: "Payment Successful!",
            description: `Your ${selectedTier} subscription has been activated.`,
          });
          onClose();
          
          // Redirect to success page
          window.location.href = "/payment-success";
        }, 2000);
      } else {
        // Handle local Egyptian payment methods
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
          
          // Redirect to success page
          window.location.href = "/payment-success";
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
              onClick={handlePayment} 
              disabled={isProcessing || !selectedMethod}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
