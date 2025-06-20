import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import PaymentSection from "@/components/PaymentSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PayPalOrderData } from "@/services/paypalService";

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const getTierDetails = (tier: string) => {
    const tiers = {
      basic: { name: "Basic", price: 2.00, exports: 2, targetedResumes: 1 },
      premium: { name: "Premium", price: 3.00, exports: 6, targetedResumes: 3 },
      unlimited: { name: "Unlimited", price: 4.99, exports: "Unlimited", targetedResumes: "Unlimited" }
    };
    return tiers[tier as keyof typeof tiers];
  };

  const handleSubscriptionSelect = (tier: string) => {
    console.log('Subscription page: Plan selected', tier);
    setSelectedTier(tier);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (details: any) => {
    console.log('Payment successful:', details);
    toast({
      title: "Payment Successful!",
      description: `Welcome to ${getTierDetails(selectedTier!)?.name} plan!`,
    });
    navigate("/?payment=success");
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    toast({
      title: "Payment Cancelled",
      description: "You can try again anytime.",
    });
    setShowPayment(false);
    setSelectedTier(null);
  };

  const getOrderData = (): PayPalOrderData => {
    if (!selectedTier) {
      return { 
        amount: "2.00", 
        currency: "USD", 
        description: "Basic Plan",
        tier: "basic"
      };
    }
    
    const tierDetails = getTierDetails(selectedTier);
    return {
      amount: tierDetails.price.toFixed(2),
      currency: "USD",
      description: `${tierDetails.name} Plan - ${tierDetails.exports} resume exports`,
      tier: selectedTier
    };
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
                  You're purchasing the {getTierDetails(selectedTier!)?.name} plan for ${getTierDetails(selectedTier!)?.price.toFixed(2)}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedTier(null);
                  }}
                  className="mt-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Plans
                </Button>
              </>
            )}
          </div>

          {!showPayment ? (
            <>
              <SubscriptionTiers onSubscriptionSelect={handleSubscriptionSelect} />

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
                orderData={getOrderData()}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Subscription;
