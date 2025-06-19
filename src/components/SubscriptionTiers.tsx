
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Target } from "lucide-react";

interface SubscriptionTiersProps {
  onSubscriptionSelect: (tier: string) => void;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({ onSubscriptionSelect }) => {
  const tiers = [
    {
      id: "basic",
      name: "Basic",
      price: 2.00,
      exports: 2,
      targetedResumes: 1,
      icon: Check,
      description: "Perfect for job seekers who need a few polished resumes",
      features: [
        "2 ATS-optimized resume exports",
        "1 targeted job resume",
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
      targetedResumes: 3,
      icon: Star,
      description: "Best for active job seekers targeting multiple positions",
      features: [
        "6 ATS-optimized resume exports",
        "3 targeted job resumes",
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
      targetedResumes: "Unlimited",
      icon: Zap,
      description: "For professionals who need maximum flexibility",
      features: [
        "Unlimited ATS-optimized exports",
        "Unlimited targeted job resumes",
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
    console.log('SubscriptionTiers: Tier selected', { tierId });
    onSubscriptionSelect(tierId);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Choose Your Plan</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          One-time payment, no recurring charges. Secure payment via PayPal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card key={tier.id} className="relative hover:shadow-lg transition-shadow h-full flex flex-col">
              {tier.badgeText && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge variant={tier.badgeVariant} className="text-xs px-3 py-1">
                    {tier.badgeText}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4 pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">
                    ${tier.price.toFixed(2)}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{tier.exports} resume exports</p>
                    <div className="flex items-center justify-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{tier.targetedResumes} targeted job resumes</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {tier.description}
                </p>
              </CardHeader>
              
              <CardContent className="px-6 pb-6 flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleTierSelect(tier.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                  size="lg"
                >
                  Choose {tier.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground mt-8 space-y-1">
        <p>• All plans include ATS optimization and AI-powered suggestions</p>
        <p>• One-time payment, no recurring charges</p>
        <p>• Secure payment processing via PayPal</p>
      </div>
    </div>
  );
};

export default SubscriptionTiers;
