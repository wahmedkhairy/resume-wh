import SEOHead from "@/components/SEOHead";

// Add this at the top of your PaymentCancelled component:
<SEOHead 
  title="Payment Cancelled - Resume Builder | Continue with Free Version"
  description="Payment was cancelled. You can continue using Resume Builder's free ATS scanner and basic resume features."
  canonicalUrl="/payment-cancelled"
  noindex={true}
/>
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, CreditCard } from "lucide-react";

const PaymentCancelled = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    // Navigate back to home where users can open the subscription dialog again
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Don't worry!</h3>
            <p className="text-sm text-blue-700">
              You can still use our free features or try subscribing again when you're ready.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <Button onClick={() => navigate("/")} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Resume Builder
            </Button>
            <Button variant="outline" onClick={handleTryAgain} className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Try Payment Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelled;
