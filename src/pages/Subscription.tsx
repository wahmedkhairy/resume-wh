
import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SubscriptionTiers from "@/components/SubscriptionTiers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Subscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscriptionSelect = (tier: string) => {
    console.log('Subscription page: Plan selected', tier);
    
    // Check if live PayPal is configured
    const savedClientId = localStorage.getItem('paypal_live_client_id');
    
    if (savedClientId) {
      toast({
        title: "Redirecting to Payment",
        description: "You'll be redirected to secure PayPal payment processing.",
      });
    } else {
      toast({
        title: "Demo Payment Selected",
        description: "This is a demo payment flow. Configure live PayPal for real transactions.",
      });
    }
    
    // Navigate back to home with subscription selection
    navigate(`/?subscription=${tier}`);
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
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground">
              Select the plan that best fits your resume export needs. All plans include AI-powered optimization and ATS-friendly templates.
            </p>
          </div>

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
        </div>
      </main>
    </div>
  );
};

export default Subscription;
