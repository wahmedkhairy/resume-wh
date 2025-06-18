
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
    <div className="w-full bg-white dark:bg-gray-900">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          One-time payment, no recurring charges. Secure payment via PayPal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card key={tier.id} className="relative hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full">
              {tier.badgeText && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge variant={tier.badgeVariant} className="text-xs px-2 py-1">
                    {tier.badgeText}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-3 pt-4">
                <div className="flex justify-center mb-2">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">{tier.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${tier.price.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {tier.exports} resume exports
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {tier.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 px-4 pb-4 flex-1 flex flex-col">
                <ul className="space-y-1 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleTierSelect(tier.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
                  size="sm"
                >
                  Choose {tier.name}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 space-y-1">
        <p>• All plans include ATS optimization and AI-powered suggestions</p>
        <p>• One-time payment, no recurring charges</p>
        <p>• Secure payment processing via PayPal</p>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionTiers;
