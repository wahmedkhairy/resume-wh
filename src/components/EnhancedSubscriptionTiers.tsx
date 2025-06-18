
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";

interface EnhancedSubscriptionTiersProps {
  onSubscriptionSelect: (tier: string) => void;
}

const EnhancedSubscriptionTiers: React.FC<EnhancedSubscriptionTiersProps> = ({ onSubscriptionSelect }) => {
  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: 2.00,
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
      price: 3.00,
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
      price: 4.99,
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

  const handleTierSelect = (tierId: string) => {
    console.log('EnhancedSubscriptionTiers: Tier selected', { tierId });
    onSubscriptionSelect(tierId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground mb-4">
          One-time payment, no recurring charges. Secure payment via PayPal.
        </p>
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
                    ${tier.price.toFixed(2)}
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
                  onClick={() => handleTierSelect(tier.id)}
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
        <p>• Secure payment processing via PayPal</p>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionTiers;
