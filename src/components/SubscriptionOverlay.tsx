
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
import { Lock, CreditCard, PaypalIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Create a PayPal icon since it's not available in lucide-react
const PaypalIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-paypal"
  >
    <path d="M7.144 19.532l1.049-5.751c.11-.606.691-1.002 1.304-.948 2.155.192 6.877.1 8.818-4.002 2.554-5.397-.59-7.769-6.295-7.769H7.43a1.97 1.97 0 0 0-1.944 1.655L2.77 19.5a1.269 1.269 0 0 0 1.255 1.5h2.012a1.272 1.272 0 0 0 1.107-.945z" />
    <path d="M7.144 19.532l1.049-5.751c.11-.606.691-1.002 1.304-.948 2.155.192 6.877.1 8.818-4.002 2.554-5.397-.59-7.769-6.295-7.769H7.43a1.97 1.97 0 0 0-1.944 1.655L2.77 19.5a1.269 1.269 0 0 0 1.255 1.5h2.012a1.272 1.272 0 0 0 1.107-.945z" />
    <path d="M15.5 7v10.5a1.5 1.5 0 0 1-3 0" />
  </svg>
);

interface SubscriptionOverlayProps {
  onClose: () => void;
}

interface PricingInfo {
  currency: string;
  amount: number;
  symbol: string;
}

const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({ onClose }) => {
  const [countryInfo, setCountryInfo] = useState<{
    country: string;
    pricing: PricingInfo;
  }>({
    country: "",
    pricing: { currency: "USD", amount: 3, symbol: "$" }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user's country and set appropriate pricing
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Default pricing (USD)
        let pricing: PricingInfo = { currency: "USD", amount: 3, symbol: "$" };
        
        // Special pricing for Egypt
        if (data.country_code === 'EG') {
          pricing = { currency: "EGP", amount: 49, symbol: "E£" };
        }
        
        setCountryInfo({
          country: data.country_name || "Unknown",
          pricing
        });
      } catch (error) {
        console.error("Error detecting location:", error);
        // Fallback to default pricing
        setCountryInfo({
          country: "Unknown",
          pricing: { currency: "USD", amount: 3, symbol: "$" }
        });
        toast({
          title: "Location Detection Failed",
          description: "Using default pricing in USD.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    detectLocation();
  }, [toast]);

  const handlePayPalCheckout = () => {
    // Simulating redirection to PayPal checkout
    toast({
      title: "Redirecting to PayPal",
      description: "You will be redirected to complete your subscription.",
    });
    
    // In a real implementation, you would:
    // 1. Create a PayPal order through your backend
    // 2. Redirect to the PayPal checkout URL
    
    // Simulate a successful payment after a delay
    setTimeout(() => {
      toast({
        title: "Subscription Successful!",
        description: "Thank you for subscribing to our premium plan.",
      });
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-resume-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">Premium Plan - {countryInfo.pricing.symbol}{countryInfo.pricing.amount}/{countryInfo.pricing.currency === "EGP" ? "month" : "month"}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Pricing for {countryInfo.country}: {countryInfo.pricing.symbol}{countryInfo.pricing.amount} {countryInfo.pricing.currency}
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                    Unlimited resume exports
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                    AI-powered content polish
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                    Advanced ATS optimization
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                    No watermarks on exports
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-resume-success" />
                    Priority customer support
                  </li>
                </ul>
                
                <div className="mt-6 space-y-3">
                  <Button 
                    onClick={handlePayPalCheckout} 
                    className="w-full flex items-center justify-center bg-[#0070ba] hover:bg-[#005ea6]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M17.5 7H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                      <path d="M10 13h4" />
                      <path d="M13 15v-4" />
                      <path d="M2 2h6v4" />
                    </svg>
                    Subscribe with PayPal
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    Secure payment processing with PayPal
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={onClose}>
            Continue with Free Plan
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
