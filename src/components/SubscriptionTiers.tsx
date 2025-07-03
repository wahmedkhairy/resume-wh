
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";

interface SubscriptionTiersProps {
  currentUserId: string;
  currentSubscription: any;
  onSubscriptionUpdate: () => void;
  onSubscriptionSelect?: (tier: string) => void;
  locationData?: {
    country: string;
    currency: {
      symbol: string;
      code: string;
      basicPrice: number;
      premiumPrice: number;
      unlimitedPrice: number;
    };
  };
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({
  currentUserId,
  currentSubscription,
  onSubscriptionUpdate,
  onSubscriptionSelect,
  locationData,
}) => {
  const getTiers = () => {
    // Always use USD pricing
    const currency = locationData?.currency || {
      symbol: '$',
      code: 'USD',
      basicPrice: 2.00,
      premiumPrice: 3.00,
      unlimitedPrice: 4.99
    };

    return [
      {
        id: "basic",
        name: "Basic",
        price: `${currency.symbol}${currency.basicPrice.toFixed(2)}`,
        period: "one-time payment",
        description: "Perfect for job seekers starting their career",
        features: [
          "2 Resume editor exports",
          "1 Targeted job resume (one-time)",
          "Basic ATS optimization",
          "PDF export",
          "Email support"
        ],
        icon: <Zap className="h-6 w-6" />,
        popular: false,
        buttonText: "Get Basic"
      },
      {
        id: "premium",
        name: "Premium",
        price: `${currency.symbol}${currency.premiumPrice.toFixed(2)}`,
        period: "one-time payment",
        description: "Most popular choice for serious job seekers",
        features: [
          "6 Resume editor exports",
          "3 Targeted job resumes (one-time)",
          "Advanced ATS analysis",
          "PDF & Word export",
          "Priority support",
          "Interview preparation tips"
        ],
        icon: <Star className="h-6 w-6" />,
        popular: true,
        buttonText: "Get Premium"
      },
      {
        id: "unlimited",
        name: "Unlimited",
        price: `${currency.symbol}${currency.unlimitedPrice.toFixed(2)}`,
        period: "one-time payment",
        description: "For professionals who need maximum flexibility",
        features: [
          "Unlimited resume editor exports",
          "Unlimited targeted job resumes",
          "Advanced career insights",
          "1-on-1 career consultation",
          "Priority queue processing",
          "White-label resume exports"
        ],
        icon: <Crown className="h-6 w-6" />,
        popular: false,
        buttonText: "Get Unlimited"
      }
    ];
  };

  const tiers = getTiers();

  const isCurrentTier = (tierId: string) => {
    return currentSubscription?.tier === tierId && currentSubscription?.status === 'active';
  };

  const canPurchase = (tierId: string) => {
    // Users can always purchase/upgrade to any tier
    return true;
  };

  const getButtonText = (tier: any) => {
    if (isCurrentTier(tier.id)) {
      return "Current Plan";
    }
    
    return tier.buttonText;
  };

  const getButtonVariant = (tier: any) => {
    if (isCurrentTier(tier.id)) {
      return "secondary";
    }
    return "default";
  };

  const handleTierClick = (tierId: string) => {
    if (isCurrentTier(tierId)) {
      return; // Don't allow clicking on current tier
    }
    
    if (onSubscriptionSelect) {
      onSubscriptionSelect(tierId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => (
        <Card 
          key={tier.id} 
          className={`relative ${tier.popular ? 'border-2 border-primary shadow-lg scale-105' : ''}`}
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              {tier.icon}
            </div>
            <CardTitle className="text-xl">{tier.name}</CardTitle>
            <div className="text-3xl font-bold text-primary">
              {tier.price}
              <span className="text-base font-normal text-muted-foreground">/{tier.period}</span>
            </div>
            <CardDescription className="text-sm">
              {tier.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <Button 
                className="w-full"
                variant={getButtonVariant(tier)}
                onClick={() => handleTierClick(tier.id)}
                disabled={isCurrentTier(tier.id)}
              >
                {getButtonText(tier)}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionTiers;
