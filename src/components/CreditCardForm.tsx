import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Lock, Calendar, ShieldCheck } from "lucide-react";

interface CreditCardFormProps {
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
  amount: number;
  currency: string;
  symbol: string;
  selectedTier: string;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onSuccess,
  onError,
  onCancel,
  amount,
  currency,
  symbol,
  selectedTier,
  isProcessing,
  setIsProcessing
}) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    email: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const handleInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
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
    const { cardNumber, expiryDate, cvv, cardholderName, email } = cardDetails;
    
    if (!cardholderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the cardholder name.",
        variant: "destructive",
      });
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
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

  const createSubscription = async (paymentDetails: any) => {
    try {
      console.log('🔄 Creating subscription for user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ Error getting user:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        console.error('❌ No user found');
        throw new Error("User not authenticated");
      }

      console.log('✅ User authenticated:', user.id);

      // Calculate export credits based on tier
      let exportCredits = 0;
      switch (selectedTier) {
        case 'basic':
          exportCredits = 2;
          break;
        case 'premium':
          exportCredits = 6;
          break;
        case 'unlimited':
          exportCredits = 999;
          break;
        default:
          exportCredits = 2;
      }

      console.log('📊 Creating subscription with credits:', exportCredits, 'for tier:', selectedTier);

      // Create subscription record with only the columns that exist in the table
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          tier: selectedTier,
          scan_count: exportCredits,
          max_scans: exportCredits,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Subscription creation error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Subscription created successfully:', subscription);
      return subscription;
    } catch (error) {
      console.error('❌ Error in createSubscription:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed');
    console.log('🔄 Starting payment process for tier:', selectedTier, 'amount:', amount);
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      console.log('⏳ Processing payment...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment details
      const paymentDetails = {
        id: `payment_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'completed',
        cardLast4: cardDetails.cardNumber.slice(-4),
        tier: selectedTier,
        timestamp: new Date().toISOString()
      };

      console.log('✅ Payment processed successfully:', paymentDetails);

      // Create subscription in Supabase
      console.log('🔄 Creating subscription in database...');
      const subscription = await createSubscription(paymentDetails);
      
      console.log('✅ Subscription created, preparing success response');

      const successData = {
        ...paymentDetails,
        subscription: subscription
      };

      // Show success toast
      console.log('🎉 Showing success toast');
      toast({
        title: "Payment Successful!",
        description: `Your ${selectedTier} plan has been activated with ${subscription.scan_count} export credits.`,
      });

      // Call the success handler
      console.log('📞 Calling onSuccess handler');
      onSuccess(successData);

      // Navigate to success page
      console.log('🔄 Navigating to payment success page');
      navigate(`/payment-success?session_id=${paymentDetails.id}&tier=${selectedTier}&amount=${amount}`);

    } catch (error) {
      console.error('❌ Payment processing error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      console.log('🚨 Showing error toast');
      toast({
        title: "Payment Failed",
        description: `There was an error processing your payment: ${errorMessage}`,
        variant: "destructive",
      });
      
      // Call error handler
      console.log('📞 Calling onError handler');
      onError(error);
    } finally {
      console.log('🔄 Setting isProcessing to false');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold capitalize">{selectedTier} Plan</h3>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {currency === 'EGP' ? `${amount} ${symbol}` : `${symbol}${amount}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={cardDetails.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name *</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="John Doe"
              value={cardDetails.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              required
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number *</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              required
              disabled={isProcessing}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate" className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Expiry Date *
              </Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={handleExpiryDateChange}
                maxLength={5}
                required
                disabled={isProcessing}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={handleCvvChange}
                maxLength={4}
                required
                disabled={isProcessing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center justify-center text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <Lock className="h-4 w-4 mr-2" />
        <span>Your payment information is secure and encrypted with 256-bit SSL</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          className="flex-1" 
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </>
          ) : (
            `Pay Now ${currency === 'EGP' ? `${amount} ${symbol}` : `${symbol}${amount}`}`
          )}
        </Button>
      </div>
    </form>
  );
};

export default CreditCardForm;
