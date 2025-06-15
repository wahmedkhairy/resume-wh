
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Infinity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { detectUserLocation, formatCurrency } from "@/utils/currencyUtils";

interface SubscriptionTiersProps {
  onSubscriptionSelect: (tier: string) => void;
  currentTier?: string;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({ onSubscriptionSelect, currentTier }) => {
  const [locationData, setLocationData] = useState<{
    country: string;
    countryCode: string;
    currency: {
      symbol: string;
      code: string;
      basicPrice: number;
      premiumPrice: number;
      unlimitedPrice: number;
    };
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadLocationData = async () => {
      try {
        setIsLoading(true);
        const data = await detectUserLocation();
        setLocationData(data);
        console.log('SubscriptionTiers: Location data loaded', data);
      } catch (error) {
        console.error("SubscriptionTiers: Error loading location data:", error);
        // Set default values on error
        setLocationData({
          country: "United States",
          countryCode: "US",
          currency: {
            symbol: "$",
            code: "USD",
            basicPrice: 2,
            premiumPrice: 3,
            unlimitedPrice: 9.9
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLocationData();
  }, []);

  const handleTierSelect = (tierId: string) => {
    onSubscriptionSelect(tierId);
  };

  if (isLoading || !locationData) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      icon: <Star className="h-6 w-6" />,
      exports: 2,
      price: {
        amount: locationData.currency.basicPrice,
        currency: locationData.currency.code,
        symbol: locationData.currency.symbol
      },
      features: [
        "Export targeted resumes",
        "2 targeted resumes per month",
        "2 resume exports",
        "Basic resume templates",
        "AI-powered summary generation",
        "PDF export",
        "Email support"
      ],
      popular: false
    },
    {
      id: "premium",
      name: "Premium",
      icon: <Crown className="h-6 w-6" />,
      exports: 6,
      price: {
        amount: locationData.currency.premiumPrice,
        currency: locationData.currency.code,
        symbol: locationData.currency.symbol
      },
      features: [
        "Export targeted resumes",
        "5 targeted resumes per month",
        "6 resume exports",
        "Premium resume templates",
        "Advanced AI optimization",
        "Multiple format exports",
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
      price: {
        amount: locationData.currency.unlimitedPrice,
        currency: locationData.currency.code,
        symbol: locationData.currency.symbol
      },
      features: [
        "Export targeted resumes",
        "Unlimited targeted resumes",
        "Unlimited exports",
        "All premium templates",
        "Advanced AI features",
        "Multiple format exports",
        "Priority support",
        "Advanced analytics",
        "Custom branding"
      ],
      popular: false
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground">
        Pricing for {locationData.country} • {locationData.currency.code} • One-time payment for exports
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
                {formatCurrency(tier.price.amount, locationData.currency)}
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
