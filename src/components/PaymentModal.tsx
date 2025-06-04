
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ').substr(0, 19) : '';
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    handleInputChange('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    handleInputChange('expiryDate', formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    handleInputChange('cvv', value);
  };

  const validateForm = () => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
    
    if (!cardholderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the cardholder name.",
        variant: "destructive",
      });
      return false;
    }

    if (cardNumber.replace(/\s/g, '').length < 13) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number.",
        variant: "destructive",
      });
      return false;
    }

    if (expiryDate.length < 5) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter a valid expiry date (MM/YY).",
        variant: "destructive",
      });
      return false;
    }

    if (cvv.length < 3) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payment Successful!",
        description: `Your ${selectedTier} subscription has been activated.`,
      });
      
      onClose();
      window.location.href = "/payment-success";
    } catch (error) {
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

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold capitalize">{selectedTier} Plan</h3>
            <p className="text-2xl font-bold">{symbol}{amount}</p>
            <p className="text-sm text-muted-foreground">{currency}</p>
          </div>

          {/* Card Payment Form */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center mb-4">
                <CreditCard className="h-5 w-5 mr-2" />
                <h4 className="font-medium">Card Details</h4>
                <Lock className="h-4 w-4 ml-auto text-green-600" />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    className="mt-1"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleExpiryDateChange}
                      className="mt-1"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleCvvChange}
                      className="mt-1"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Lock className="h-4 w-4 mr-2" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment} 
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : `Pay ${symbol}${amount}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
