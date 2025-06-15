import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectUserLocation, formatCurrency } from "@/utils/currencyUtils";

interface SubscriptionOverlayProps {
  onClose: () => void;
  onSubscriptionComplete?: () => void;
}

const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({ onClose, onSubscriptionComplete }) => {
  const [locationData, setLocationData] = useState<{
    country: string;
    currency: {
      symbol: string;
      code: string;
      basicPrice: number;
      premiumPrice: number;
      unlimitedPrice: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        setIsLoading(true);
        const data = await detectUserLocation();
        setLocationData({
          country: data.country,
          currency: {
            symbol: data.currency.symbol,
            code: data.currency.code,
            basicPrice: data.currency.basicPrice,
            premiumPrice: data.currency.premiumPrice,
            unlimitedPrice: data.currency.unlimitedPrice
          }
        });
        console.log('SubscriptionOverlay: Location data loaded', data);
      } catch (error) {
        console.error("SubscriptionOverlay: Error loading location data:", error);
        // Set default values on error
        setLocationData({
          country: "United States",
          currency: {
            symbol: "$",
            code: "USD",
            basicPrice: 2,
            premiumPrice: 3,
            unlimitedPrice: 9.9
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocationData();
  }, []);

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
        title: "Subscription Successful!",
        description: "Thank you for subscribing to our premium plan.",
      });
      
      if (onSubscriptionComplete) {
        onSubscriptionComplete();
      }
      
      onClose();
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5 text-resume-primary" />
            Unlock Premium Features
          </CardTitle>
          <CardDescription>
            Subscribe to access all premium features and export your ATS-optimized resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || !locationData ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-resume-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Plan Summary */}
              <div className="border rounded-lg p-4 bg-muted">
                <h3 className="text-lg font-bold mb-2">
                  Premium Plan - {formatCurrency(locationData.currency.premiumPrice, locationData.currency)}/month
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Pricing for {locationData.country}: {formatCurrency(locationData.currency.premiumPrice, locationData.currency)} {locationData.currency.code}
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                    Unlimited resume exports
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                    AI-powered content polish
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                    Advanced ATS optimization
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-600" />
                    No watermarks on exports
                  </li>
                </ul>
              </div>

              {/* Card Payment Form */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2" />
                  <h4 className="font-medium">Payment Details</h4>
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
              </div>

              {/* Security Notice */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="h-4 w-4 mr-2" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
            Continue with Free Plan
          </Button>
          <Button 
            onClick={handlePayment} 
            className="flex-1"
            disabled={isProcessing || isLoading || !locationData}
          >
            {isProcessing ? "Processing..." : locationData ? `Subscribe ${formatCurrency(locationData.currency.premiumPrice, locationData.currency)}` : "Subscribe"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default SubscriptionOverlay;
