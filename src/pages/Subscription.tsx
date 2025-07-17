import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import PaymentSection from "@/components/PaymentSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Subscription = () => {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment'>('plans');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // USD pricing only
  const usdPricing = {
    symbol: '$',
    code: 'USD',
    basicPrice: 2.00,
    premiumPrice: 3.00,
    unlimitedPrice: 4.99
  };

  const orderData = React.useMemo(() => {
    if (!selectedTier) return null;

    const prices = {
      basic: usdPricing.basicPrice,
      premium: usdPricing.premiumPrice,
      unlimited: usdPricing.unlimitedPrice
    };

    return {
      amount: prices[selectedTier as keyof typeof prices].toFixed(2),
      currency: usdPricing.code,
      description: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan`,
      tier: selectedTier
    };
  }, [selectedTier, usdPricing]);

  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }
        setCurrentUserId(user.id);

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

  const handleSubscriptionSelect = useCallback((tier: string) => {
    console.log('Subscription tier selected:', tier);
    setSelectedTier(tier);
    setCurrentStep('payment');
  }, []);

  const handlePaymentSuccess = useCallback(async (details: any) => {
    if (paymentProcessing) return;
    
    setPaymentProcessing(true);
    
    try {
      console.log('Payment successful, processing subscription update:', details);
      
      const tierPricing = {
        basic: { scans: 2, max_scans: 2 },
        premium: { scans: 6, max_scans: 6 },
        unlimited: { scans: 999, max_scans: 999 }
      };

      const tierData = tierPricing[selectedTier as keyof typeof tierPricing];
      
      if (currentSubscription) {
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

      const successUrl = `/payment-success?session_id=${details.id}&tier=${selectedTier}&amount=${details.amount}&currency=${details.currency}`;
      console.log('Navigating to:', successUrl);
      navigate(successUrl);
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Payment successful but failed to activate subscription. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
    }
  }, [selectedTier, currentSubscription, currentUserId, paymentProcessing, toast, navigate]);

  const handlePaymentError = useCallback((error: any) => {
    console.error('Payment error:', error);
    setPaymentProcessing(false);
    toast({
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  const handlePaymentCancel = useCallback(() => {
    console.log('Payment cancelled by user');
    setPaymentProcessing(false);
    setCurrentStep('plans');
    setSelectedTier(null);
    toast({
      title: "Payment Cancelled",
      description: "You can try again when you're ready.",
    });
  }, [toast]);

  const handleBackToPlans = useCallback(() => {
    setCurrentStep('plans');
    setSelectedTier(null);
    setPaymentProcessing(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEOHead
          title="Resume Builder Pricing - Affordable ATS Resume Builder Plans Under $5"
          description="Choose from our affordable resume builder plans with ATS optimization features. Includes AI-powered resume check to improve resume for applicant tracking systems."
          canonicalUrl="https://resumewh.com/subscription"
          keywords="resume builder pricing under $5 per month, free resume maker, ATS resume builder, export resume to PDF and Word online, cloud resume builder with PayPal checkout, ATS resume checker, optimize resume for ATS, ATS compatibility test, improve resume for applicant tracking system"
          ogTitle="Resume Builder Pricing - Affordable Plans Under $5"
          ogDescription="Affordable resume builder with ATS optimization features starting under $5 per month. Includes free ATS resume scan to check if resume passes ATS."
          ogUrl="https://resumewh.com/subscription"
          twitterTitle="Resume Builder Pricing - Affordable Plans Under $5"
          twitterDescription="Affordable resume builder with ATS score calculator and AI-powered resume check for applicant tracking systems."
        />
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
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="Resume Builder Pricing - Affordable ATS Resume Builder Plans Under $5"
        description="Choose from our affordable resume builder plans with ATS optimization features. Includes AI-powered resume check to improve resume for applicant tracking systems."
        canonicalUrl="https://resumewh.com/subscription"
        keywords="resume builder pricing under $5 per month, free resume maker, ATS resume builder, export resume to PDF and Word online, cloud resume builder with PayPal checkout, ATS resume checker, optimize resume for ATS, ATS compatibility test, improve resume for applicant tracking system"
        ogTitle="Resume Builder Pricing - Affordable Plans Under $5"
        ogDescription="Affordable resume builder with ATS optimization features starting under $5 per month. Includes free ATS resume scan to check if resume passes ATS."
        ogUrl="https://resumewh.com/subscription"
        twitterTitle="Resume Builder Pricing - Affordable Plans Under $5"
        twitterDescription="Affordable resume builder with ATS score calculator and AI-powered resume check for applicant tracking systems."
      />
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
              <p className="text-sm text-muted-foreground">
                All prices in USD - Available worldwide
              </p>
            </div>
          </div>

          {/* Plans Step */}
          <div className={currentStep === 'plans' ? 'block' : 'hidden'}>
            <SubscriptionTiers
              currentUserId={currentUserId}
              currentSubscription={currentSubscription}
              onSubscriptionUpdate={() => {
                window.location.reload();
              }}
              onSubscriptionSelect={handleSubscriptionSelect}
              locationData={{
                country: 'United States',
                currency: usdPricing
              }}
            />
          </div>

          {/* Payment Step */}
          <div className={currentStep === 'payment' ? 'block' : 'hidden'}>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent>
                  <div className="space-y-6">
                    {orderData && (
                      <PaymentSection
                        orderData={orderData}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        onCancel={handlePaymentCancel}
                      />
                    )}
                    
                    <div className="text-center">
                      <Button
                        variant="outline"
                        onClick={handleBackToPlans}
                        className="mt-4"
                        disabled={paymentProcessing}
                      >
                        {paymentProcessing ? "Processing..." : "Back to Plans"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Subscription;
