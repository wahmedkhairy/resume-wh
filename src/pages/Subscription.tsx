import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import PaymentSection from "@/components/PaymentSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectUserLocation } from "@/utils/currencyUtils";
import { supabase } from "@/integrations/supabase/client";
import { PayPalOrderData } from "@/services/paypalService";

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
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

  React.useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Load subscription data
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setCurrentSubscription(subscription);
      }
    };
    
    loadUserData();
  }, []);

  React.useEffect(() => {
    const loadLocationData = async () => {
      try {
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
      } catch (error) {
        console.error("Error loading location data:", error);
        // Set default values on error
        setLocationData({
          country: "United States",
          currency: {
            symbol: "$",
            code: "USD",
            basicPrice: 2,
            premiumPrice: 3,
            unlimitedPrice: 4.99
          }
        });
      }
    };
    
    loadLocationData();
  }, []);

  React.useEffect(() => {
    // Check if PayPal Live Client ID is set in localStorage
    const liveClientId = localStorage.getItem('paypal_live_client_id');
    if (!liveClientId && showPayment) {
      toast({
        title: "PayPal Configuration Missing",
        description: "Please configure your PayPal Live Client ID in the admin settings.",
        variant: "destructive"
      });
    }
  }, [showPayment, toast]);

  const getTierDetails = (tier: string) => {
    if (!locationData) return { name: "Basic", price: 2.00, exports: 2, targetedResumes: 1 };
    
    const tiers = {
      basic: { name: "Basic", price: locationData.currency.basicPrice, exports: 2, targetedResumes: 1 },
      premium: { name: "Premium", price: locationData.currency.premiumPrice, exports: 6, targetedResumes: 3 },
      unlimited: { name: "Unlimited", price: locationData.currency.unlimitedPrice, exports: "Unlimited", targetedResumes: "Unlimited" }
    };
    return tiers[tier as keyof typeof tiers];
  };

  // Convert local currency to USD for PayPal
  const convertToUSD = (localAmount: number, currencyCode: string) => {
    if (currencyCode === 'EGP') {
      // Convert EGP to USD using approximate rate
      // EGP 99 = USD 2, EGP 149 = USD 3, EGP 249 = USD 4.99
      switch (localAmount) {
        case 99:
          return 2.00;
        case 149:
          return 3.00;
        case 249:
          return 4.99;
        default:
          return localAmount / 49.5; // Approximate conversion rate
      }
    }
    return localAmount; // Already in USD
  };

  const handleSubscriptionSelect = (tier: string) => {
    console.log('Subscription page: Plan selected', tier);
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const handleSubscriptionUpdate = () => {
    // Refresh subscription data
    if (currentUserId) {
      const loadSubscription = async () => {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        setCurrentSubscription(subscription);
      };
      loadSubscription();
    }
  };

  const createSubscription = async (paymentDetails: any) => {
    try {
      console.log('🔄 Creating subscription for user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
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

  const handlePaymentSuccess = async (details: any) => {
    console.log('PayPal payment successful:', details);
    setIsProcessing(true);
    
    try {
      const subscription = await createSubscription(details);
      
      const tierDetails = getTierDetails(selectedTier!);
      toast({
        title: "Payment Successful!",
        description: `Your ${selectedTier} plan has been activated with ${subscription.scan_count} export credits.`,
      });

      handleSubscriptionUpdate();
      navigate(`/payment-success?session_id=${details.id}&tier=${selectedTier}&amount=${tierDetails?.price}`);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Payment Processed, but...",
        description: "Payment was successful but there was an issue updating your account. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('PayPal payment error:', error);
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
    setIsProcessing(false);
  };

  const handlePaymentCancel = () => {
    console.log('PayPal payment cancelled');
    setShowPayment(false);
    setSelectedTier(null);
    setIsProcessing(false);
  };

  if (!locationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getPayPalOrderData = (): PayPalOrderData => {
    const tierDetails = getTierDetails(selectedTier!);
    const usdAmount = convertToUSD(tierDetails.price, locationData.currency.code);
    
    console.log('Converting payment:', {
      originalAmount: tierDetails.price,
      originalCurrency: locationData.currency.code,
      usdAmount: usdAmount,
      tier: selectedTier
    });

    return {
      amount: usdAmount.toFixed(2),
      currency: "USD", // PayPal integration uses USD
      description: `${tierDetails.name} Plan - ${tierDetails.exports} exports`,
      tier: selectedTier!
    };
  };

  const formatDisplayPrice = (price: number) => {
    if (locationData.currency.code === 'EGP') {
      return `${locationData.currency.symbol} ${price}`;
    }
    return `${locationData.currency.symbol}${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resume Builder
            </Button>
            
            {!showPayment ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Choose Your Plan
                </h1>
                <p className="text-muted-foreground">
                  Select the plan that best fits your resume export needs. All plans include AI-powered optimization and ATS-friendly templates.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Complete Your Purchase
                </h1>
                <p className="text-muted-foreground">
                  You're purchasing the {getTierDetails(selectedTier!)?.name} plan for {formatDisplayPrice(getTierDetails(selectedTier!)?.price)}
                  {locationData.currency.code !== 'USD' && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (Processing in USD: ${convertToUSD(getTierDetails(selectedTier!)?.price, locationData.currency.code).toFixed(2)})
                    </span>
                  )}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedTier(null);
                  }}
                  className="mt-4"
                  disabled={isProcessing}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
              </>
            )}
          </div>

          {!showPayment ? (
            <>
              <SubscriptionTiers 
                currentUserId={currentUserId}
                currentSubscription={currentSubscription}
                onSubscriptionUpdate={handleSubscriptionUpdate}
                onSubscriptionSelect={handleSubscriptionSelect}
                locationData={locationData}
              />

              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Why Choose Our Resume Builder?</CardTitle>
                  <CardDescription>
                    Get the competitive edge you need in today's job market
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-blue-600 font-bold">ATS</span>
                    </div>
                    <h3 className="font-semibold mb-2">ATS Optimized</h3>
                    <p className="text-sm text-muted-foreground">
                      Our resumes are designed to pass through Applicant Tracking Systems with ease.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-green-600 font-bold">AI</span>
                    </div>
                    <h3 className="font-semibold mb-2">AI-Powered</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced AI helps optimize your content for maximum impact and relevance.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <span className="text-purple-600 font-bold">✓</span>
                    </div>
                    <h3 className="font-semibold mb-2">Proven Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Join thousands of successful job seekers who landed their dream jobs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <PaymentSection
                orderData={getPayPalOrderData()}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
                useRawHTML={true}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Subscription;
