
import React from "react";
import { Shield, Infinity } from "lucide-react";

interface SubscriptionStatusProps {
  isPremiumUser: boolean;
  currentSubscription: any;
  getRemainingExports?: () => number;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  isPremiumUser,
  currentSubscription,
  getRemainingExports,
}) => {
  if (!isPremiumUser || !currentSubscription) {
    return null;
  }

  const remainingExports = getRemainingExports ? getRemainingExports() : currentSubscription.scan_count;
  const isUnlimited = currentSubscription.tier === 'unlimited';

  // Get the correct plan name with proper capitalization
  const getPlanDisplayName = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'Basic';
      case 'premium':
        return 'Premium';
      case 'unlimited':
        return 'Unlimited';
      default:
        return tier.charAt(0).toUpperCase() + tier.slice(1);
    }
  };

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="font-medium text-green-800">
            {getPlanDisplayName(currentSubscription.tier)} Plan Active
          </span>
        </div>
        <div className="flex items-center text-green-600 font-medium">
          {isUnlimited ? (
            <>
              <Infinity className="h-4 w-4 mr-1" />
              <span>Unlimited exports</span>
            </>
          ) : (
            <span>{remainingExports} exports remaining</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
