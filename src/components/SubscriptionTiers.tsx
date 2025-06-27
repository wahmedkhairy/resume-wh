
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
    if (!locationData) {
      return [
        {
          id: "basic",
          name: "Basic",
          price: "$2.00",
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
          price: "$3.00",
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
          price: "$4.99",
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
    }

    const formatPrice = (amount: number) => {
      if (locationData.currency.code === 'EGP') {
        return `${locationData.currency.symbol} ${amount}`;
      }
      return `${locationData.currency.symbol}${amount.toFixed(2)}`;
    };

    return [
      {
        id: "basic",
        name: "Basic",
        price: formatPrice(locationData.currency.basicPrice),
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
        price: formatPrice(locationData.currency.premiumPrice),
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
        price: formatPrice(locationData.currency.unlimitedPrice),
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
    return currentSubscription?.tier === tierId && currentSubscription?.status === 'active';
  };

  const canResubscribe = (tierId: string) => {
    // Allow subscription if:
    // 1. User has no active subscription
    // 2. Or user has an active subscription but no remaining exports (can subscribe to any plan)
    // 3. Or user has inactive subscription
    if (!currentSubscription) return true;
    
    const noRemainingExports = currentSubscription.scan_count <= 0;
    const isInactive = currentSubscription.status !== 'active';
    
    // If user has no remaining exports, they can subscribe to any plan (including upgrading/downgrading)
    return isInactive || noRemainingExports;
  };

  const getButtonText = (tier: any) => {
    if (isCurrentTier(tier.id) && currentSubscription?.scan_count > 0) {
      return "Current Plan";
    }
    
    // If user has no remaining exports, show appropriate text
    if (currentSubscription?.scan_count <= 0) {
      if (currentSubscription?.tier === tier.id) {
        return `Renew ${tier.name}`;
      } else {
        return `Switch to ${tier.name}`;
      }
    }
    
    return tier.buttonText;
  };

  const handleTierClick = (tierId: string) => {
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
              {isCurrentTier(tier.id) && currentSubscription?.scan_count > 0 ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleTierClick(tier.id)}
                  disabled={!canResubscribe(tier.id) && !isCurrentTier(tier.id)}
                >
                  {getButtonText(tier)}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionTiers;
