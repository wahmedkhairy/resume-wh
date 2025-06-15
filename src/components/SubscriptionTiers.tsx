
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Infinity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingInfo {
  currency: string;
  amount: number;
  symbol: string;
}

interface SubscriptionTiersProps {
  onSubscriptionSelect: (tier: string) => void;
  currentTier?: string;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({ onSubscriptionSelect, currentTier }) => {
  const [countryInfo, setCountryInfo] = useState<{
    country: string;
    pricing: {
      basic: PricingInfo;
      premium: PricingInfo;
      unlimited: PricingInfo;
    };
  }>({
    country: "",
    pricing: {
      basic: { currency: "USD", amount: 2, symbol: "$" },
      premium: { currency: "USD", amount: 3, symbol: "$" },
      unlimited: { currency: "USD", amount: 9.9, symbol: "$" }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const detectLocation = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        let pricing = {
          basic: { currency: "USD", amount: 2, symbol: "$" },
          premium: { currency: "USD", amount: 3, symbol: "$" },
          unlimited: { currency: "USD", amount: 9.9, symbol: "$" }
        };
        
        // Special pricing for Egypt
        if (data.country_code === 'EG') {
          pricing = {
            basic: { currency: "EGP", amount: 39, symbol: "EGP" },
            premium: { currency: "EGP", amount: 49, symbol: "EGP" },
            unlimited: { currency: "EGP", amount: 99, symbol: "EGP" }
          };
        }
        
        setCountryInfo({
          country: data.country_name || "Unknown",
          pricing
        });
      } catch (error) {
        console.error("Error detecting location:", error);
        setCountryInfo({
          country: "Unknown",
          pricing: {
            basic: { currency: "USD", amount: 2, symbol: "$" },
            premium: { currency: "USD", amount: 3, symbol: "$" },
            unlimited: { currency: "USD", amount: 9.9, symbol: "$" }
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    detectLocation();
  }, []);

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      icon: <Star className="h-6 w-6" />,
      exports: 2,
      price: countryInfo.pricing.basic,
      features: [
        "2 resume exports",
        "Basic resume templates",
        "AI-powered summary generation",
        "PDF export",
        "1 tailored resume per month",
        "Email support"
      ],
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      icon: <Crown className="h-6 w-6" />,
      exports: 6,
      price: countryInfo.pricing.premium,
      features: [
        "6 resume exports",
        "Premium resume templates",
        "Advanced AI optimization",
        "Multiple format exports",
        "3 tailored resumes per month",
        "Priority email support",
        "Analytics dashboard"
      ],
      popular: true
    },
    {
      id: "unlimited",
      name: "Unlimited",
      icon: <Infinity className="h-6 w-6" />,
      exports: "Unlimited",
      price: countryInfo.pricing.unlimited,
      features: [
        "Unlimited exports",
        "All premium templates",
        "Advanced AI features",
        "Multiple format exports",
        "Unlimited tailored resumes",
        "Priority support",
        "Advanced analytics",
        "Custom branding"
      ],
      popular: false
    }
  ];

  const handleTierSelect = (tierId: string) => {
    onSubscriptionSelect(tierId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Pricing for {countryInfo.country} • {countryInfo.pricing.basic.currency} • One-time payment for exports
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''} ${currentTier === tier.id ? 'ring-2 ring-primary' : ''}`}
          >
            {tier.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="text-3xl font-bold">
                {tier.price?.currency === 'EGP' ? `${tier.price?.amount} ${tier.price?.symbol}` : `${tier.price?.symbol}${tier.price?.amount}`}
                <span className="text-sm font-normal text-muted-foreground">
                  one-time
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {typeof tier.exports === 'number' ? `${tier.exports} exports` : `${tier.exports} exports`}
              </p>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full"
                variant={currentTier === tier.id ? "outline" : "default"}
                onClick={() => handleTierSelect(tier.id)}
                disabled={currentTier === tier.id}
              >
                {currentTier === tier.id ? "Current Plan" : "Subscribe Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionTiers;
