
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";
import { detectUserLocation } from "@/utils/currencyUtils";
import { getPayPalPricing, formatPayPalPrice } from "@/utils/paypalCurrencyUtils";

interface EnhancedSubscriptionTiersProps {
  onSubscriptionSelect: (tier: string) => void;
}

const EnhancedSubscriptionTiers: React.FC<EnhancedSubscriptionTiersProps> = ({ onSubscriptionSelect }) => {
  const [locationData, setLocationData] = useState<any>(null);
  const [hasLiveConfig, setHasLiveConfig] = useState(false);

  useEffect(() => {
    const checkConfig = () => {
      const savedClientId = localStorage.getItem('paypal_live_client_id');
      setHasLiveConfig(!!savedClientId);
    };

    const loadLocationData = async () => {
      try {
        const data = await detectUserLocation();
        setLocationData(data);
        console.log('SubscriptionTiers: Location data loaded', data);
      } catch (error) {
        console.error('Error loading location data:', error);
        // Fallback to USD pricing
        setLocationData({
          country: "United States",
          countryCode: "US",
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

    checkConfig();
    loadLocationData();
  }, []);

  if (!locationData) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use USD pricing for live PayPal, location-based for demo
  const pricing = hasLiveConfig ? getPayPalPricing() : locationData.currency;
  const currencySymbol = hasLiveConfig ? "$" : pricing.symbol;
  const currencyCode = hasLiveConfig ? "USD" : pricing.code;

  const formatPrice = (price: number) => {
    return hasLiveConfig ? formatPayPalPrice(price) : price.toString();
  };

  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: hasLiveConfig ? pricing.basicPrice : pricing.basicPrice,
      exports: 2,
      icon: Check,
      description: "Perfect for job seekers who need a few polished resumes",
      features: [
        "2 ATS-optimized resume exports",
        "AI-powered content suggestions",
        "Basic templates",
        "Email support"
      ],
      badgeText: "Most Popular",
      badgeVariant: "secondary" as const
    },
    {
      id: "premium",
      name: "Premium",
      price: hasLiveConfig ? pricing.premiumPrice : pricing.premiumPrice,
      exports: 6,
      icon: Star,
      description: "Best for active job seekers targeting multiple positions",
      features: [
        "6 ATS-optimized resume exports",
        "Advanced AI optimization",
        "Premium templates",
        "Priority support",
        "Cover letter templates"
      ],
      badgeText: "Best Value",
      badgeVariant: "default" as const
    },
    {
      id: "unlimited",
      name: "Unlimited",
      price: hasLiveConfig ? pricing.unlimitedPrice : pricing.unlimitedPrice,
      exports: "Unlimited",
      icon: Zap,
      description: "For professionals who need maximum flexibility",
      features: [
        "Unlimited ATS-optimized exports",
        "All premium features",
        "Custom branding options",
        "24/7 priority support",
        "Resume analytics dashboard"
      ],
      badgeText: "Pro Choice",
      badgeVariant: "destructive" as const
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground mb-4">
          {hasLiveConfig 
            ? `Live PayPal payments in ${currencyCode} - Real transactions will be processed`
            : `Pricing shown in ${currencyCode} for ${locationData.country}`
          }
        </p>
        {hasLiveConfig && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-6">
            <p className="text-sm text-green-800 font-medium">
              🔒 Secure live payments via PayPal
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card key={tier.id} className="relative hover:shadow-lg transition-shadow">
              {tier.badgeText && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant={tier.badgeVariant}>{tier.badgeText}</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold">
                    {currencySymbol}{formatPrice(tier.price)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.exports} resume exports
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {tier.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => onSubscriptionSelect(tier.id)}
                  className="w-full"
                  variant={tier.id === "premium" ? "default" : "outline"}
                >
                  Choose {tier.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>• All plans include ATS optimization and AI-powered suggestions</p>
        <p>• One-time payment, no recurring charges</p>
        <p>• {hasLiveConfig ? "Secure payment processing via PayPal" : "Demo mode - test payments only"}</p>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionTiers;
