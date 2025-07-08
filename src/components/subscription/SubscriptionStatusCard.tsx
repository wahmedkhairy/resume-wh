
import React from "react";
import { Shield, Infinity, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionStatusCardProps {
  subscription: any;
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ subscription }) => {
  // Don't show anything if no subscription or demo tier
  if (!subscription || subscription.tier === 'demo' || !subscription.tier) {
    return null;
  }

  const getTierDisplayInfo = () => {
    const tier = subscription.tier;
    const isUnlimited = tier === 'unlimited';
    const remainingExports = isUnlimited ? 999 : (subscription.scan_count || 0);
    
    return {
      isUnlimited,
      remainingExports,
      isActive: subscription.status === 'active'
    };
  };

  const tierInfo = getTierDisplayInfo();

  if (!tierInfo.isActive) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">
              Subscription Status - Inactive
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Subscription Status
            </span>
          </div>
          
          <div className="flex items-center text-green-600 font-medium">
            {tierInfo.isUnlimited ? (
              <>
                <Infinity className="h-4 w-4 mr-1" />
                <span>Unlimited exports</span>
              </>
            ) : (
              <span>{tierInfo.remainingExports} exports remaining</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
