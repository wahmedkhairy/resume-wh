
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import LivePayPalCheckout from "@/components/LivePayPalCheckout";

interface SubscriptionTiersProps {
  currentUserId: string;
  currentSubscription: any;
  onSubscriptionUpdate: () => void;
  onSubscriptionSelect?: (tier: string) => void;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({
  currentUserId,
  currentSubscription,
  onSubscriptionUpdate,
  onSubscriptionSelect,
}) => {
  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: "$9.99",
      period: "month",
      description: "Perfect for job seekers starting their career",
      features: [
        "1 Professional resume template",
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
      price: "$19.99",
      period: "month",
      description: "Most popular choice for serious job seekers",
      features: [
        "All Basic features",
        "3 Professional resume templates",
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
      price: "$39.99",
      period: "month",
      description: "For professionals who need maximum flexibility",
      features: [
        "All Premium features",
        "Unlimited resume templates",
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

  const isCurrentTier = (tierId: string) => {
    return currentSubscription?.tier === tierId && currentSubscription?.status === 'active';
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
              {isCurrentTier(tier.id) ? (
                <Button className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleTierClick(tier.id)}
                >
                  {tier.buttonText}
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
