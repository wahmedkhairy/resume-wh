import SEOHead from "@/components/SEOHead";

// Add this at the top of your PaymentSuccess component:
<SEOHead 
  title="Payment Successful - Resume Builder | Premium Access Activated"
  description="Payment successful! Your Resume Builder premium subscription is now active. Start creating ATS-optimized resumes."
  canonicalUrl="/payment-success"
  noindex={true}
/>
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const processPaymentSuccess = async () => {
      if (!sessionId) {
        setIsProcessing(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/");
          return;
        }

        // Get updated subscription details
        const { data: subscription, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscriptionDetails(subscription);
        }

        toast({
          title: "Payment Successful!",
          description: "Your subscription has been activated. You can now export your resume.",
        });
      } catch (error) {
        console.error('Error processing payment success:', error);
        toast({
          title: "Payment Processed",
          description: "Your payment was successful. Please refresh the page to see your updated subscription.",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPaymentSuccess();
  }, [sessionId, navigate, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Processing your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your purchase! Your subscription has been activated and you can now access all premium features.
          </p>
          
          {subscriptionDetails && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Your Plan Details:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Plan: {subscriptionDetails.tier?.charAt(0).toUpperCase() + subscriptionDetails.tier?.slice(1)}</li>
                <li>• Export Credits: {subscriptionDetails.scan_count === 999 ? 'Unlimited' : subscriptionDetails.scan_count}</li>
                <li>• Status: {subscriptionDetails.status}</li>
              </ul>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What's included:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• ATS-optimized resume exports</li>
              <li>• AI-powered content generation</li>
              <li>• Multiple export formats</li>
              <li>• Premium templates</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate("/")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Resume Builder
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export My Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
