
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
          "2 Professional resume exports",
          "Basic ATS optimization",
          "PDF export",
          "1 Targeted resume per month",
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
          "All Basic features",
          "6 Professional resume exports",
          "Advanced ATS analysis",
          "PDF & Word export",
          "3 Targeted resumes per month",
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
          "All Premium features",
          "Unlimited resume exports",
          "Unlimited targeted resumes",
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
    if (!currentSubscription) return false;
    return currentSubscription.tier === tierId && currentSubscription.status === 'active';
  };

  const canPurchase = (tierId: string) => {
    // Always allow purchasing if no subscription exists
    if (!currentSubscription) return true;
    
    // Allow purchasing if current tier is demo or different tier
    if (currentSubscription.tier === 'demo' || currentSubscription.tier !== tierId) {
      return true;
    }
    
    // Allow re-purchasing if no remaining scans
    if (currentSubscription.tier === tierId && currentSubscription.scan_count <= 0) {
      return true;
    }
    
    return false;
  };

  const getButtonText = (tier: any) => {
    if (isCurrentTier(tier.id) && currentSubscription?.scan_count > 0) {
      return "Current Plan";
    }
    
    if (currentSubscription?.tier === tier.id && currentSubscription?.scan_count <= 0) {
      return `Renew ${tier.name}`;
    }
    
    if (currentSubscription?.tier && currentSubscription.tier !== 'demo' && currentSubscription.tier !== tier.id) {
      return `Switch to ${tier.name}`;
    }
    
    return tier.buttonText;
  };

  const handleTierClick = (tierId: string) => {
    console.log('Tier clicked:', tierId);
    if (onSubscriptionSelect && canPurchase(tierId)) {
      onSubscriptionSelect(tierId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiers.map((tier) => {
        const isCurrentPlan = isCurrentTier(tier.id);
        const canPurchaseTier = canPurchase(tier.id);
        
        return (
          <Card 
            key={tier.id} 
            className={`relative bg-white ${tier.popular ? 'border-2 border-primary shadow-lg scale-105' : ''}`}
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
                  className={`w-full ${isCurrentPlan && currentSubscription?.scan_count > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-primary-foreground`}
                  onClick={() => handleTierClick(tier.id)}
                  disabled={isCurrentPlan && currentSubscription?.scan_count > 0}
                >
                  {getButtonText(tier)}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionTiers;
