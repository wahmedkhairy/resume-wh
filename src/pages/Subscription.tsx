import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import PaymentSection from "@/components/PaymentSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LocationData {
  country: string;
  currency: {
    symbol: string;
    code: string;
    basicPrice: number;
    premiumPrice: number;
    unlimitedPrice: number;
  };
}

const Subscription = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setCurrentUserId(user.id);

        // Fetch location data for pricing
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          
          const isEgypt = data.country_code === 'EG';
          setLocationData({
            country: data.country_name || 'Unknown',
            currency: {
              symbol: isEgypt ? 'EGP' : '$',
              code: isEgypt ? 'EGP' : 'USD',
              basicPrice: isEgypt ? 99 : 2.00,
              premiumPrice: isEgypt ? 149 : 3.00,
              unlimitedPrice: isEgypt ? 249 : 4.99
            }
          });
        } catch (error) {
          console.error('Error fetching location:', error);
          // Default to USD pricing
          setLocationData({
            country: 'Unknown',
            currency: {
              symbol: '$',
              code: 'USD',
              basicPrice: 2.00,
              premiumPrice: 3.00,
              unlimitedPrice: 4.99
            }
          });
        }

        // Fetch current subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setCurrentSubscription(subscription);
      } catch (error) {
        console.error('Error initializing subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();
  }, [navigate, toast]);

  const handleSubscriptionSelect = (tier: string) => {
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      const tierPricing = {
        basic: { scans: 2, max_scans: 2 },
        premium: { scans: 6, max_scans: 6 },
        unlimited: { scans: 999, max_scans: 999 }
      };

      const tierData = tierPricing[selectedTier as keyof typeof tierPricing];
      
      if (currentSubscription) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            tier: selectedTier,
            scan_count: tierData.scans,
            max_scans: tierData.max_scans,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', currentUserId);

        if (error) throw error;
      } else {
        // Create new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: currentUserId,
            tier: selectedTier,
            scan_count: tierData.scans,
            max_scans: tierData.max_scans,
            status: 'active'
          });

        if (error) throw error;
      }

      toast({
        title: "Payment Successful!",
        description: `Your ${selectedTier} plan is now active.`,
      });

      // Redirect to main app
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Payment successful but failed to activate subscription. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      variant: "destructive",
    });
    setShowPayment(false);
    setSelectedTier(null);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedTier(null);
  };

  const getOrderData = () => {
    if (!selectedTier || !locationData) return null;

    const prices = {
      basic: locationData.currency.basicPrice,
      premium: locationData.currency.premiumPrice,
      unlimited: locationData.currency.unlimitedPrice
    };

    return {
      amount: prices[selectedTier as keyof typeof prices].toString(),
      currency: locationData.currency.code,
      description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan`,
      tier: selectedTier
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading subscription plans...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resume Builder
            </Button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
              <p className="text-xl text-muted-foreground mb-2">
                Unlock the full potential of your resume
              </p>
              {locationData && (
                <p className="text-sm text-muted-foreground">
                  Pricing for {locationData.country} ({locationData.currency.code})
                </p>
              )}
            </div>
          </div>

          {!showPayment ? (
            <SubscriptionTiers
              currentUserId={currentUserId}
              currentSubscription={currentSubscription}
              onSubscriptionUpdate={() => {
                // Refresh subscription data
                window.location.reload();
              }}
              onSubscriptionSelect={handleSubscriptionSelect}
              locationData={locationData || undefined}
            />
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Complete Your Purchase</CardTitle>
                  <p className="text-muted-foreground">
                    {selectedTier?.charAt(0).toUpperCase() + selectedTier?.slice(1)} Plan
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-xl font-bold">
                        {locationData?.currency.symbol}
                        {getOrderData()?.amount} {locationData?.currency.code}
                      </span>
                    </div>
                    
                    {getOrderData() && (
                      <PaymentSection
                        orderData={getOrderData()!}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onCancel={handlePaymentCancel}
                        useRawHTML={true}
                      />
                    )}
                    
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={handlePaymentCancel}
                        className="mt-4"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;
