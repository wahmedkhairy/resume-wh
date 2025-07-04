
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
  
  // Get the proper plan name based on the actual tier
  const getPlanName = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'Basic Plan';
      case 'premium':
        return 'Premium Plan';
      case 'unlimited':
        return 'Unlimited Plan';
      default:
        return 'Plan';
    }
  };

  // Get the appropriate background color based on tier
  const getBackgroundColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-green-50 border-green-200';
      case 'premium':
        return 'bg-blue-50 border-blue-200';
      case 'unlimited':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  // Get the appropriate text color based on tier
  const getTextColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'text-green-800';
      case 'premium':
        return 'text-blue-800';
      case 'unlimited':
        return 'text-yellow-800';
      default:
        return 'text-green-800';
    }
  };

  // Get the appropriate icon color based on tier
  const getIconColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'text-green-600';
      case 'premium':
        return 'text-blue-600';
      case 'unlimited':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  // Get the appropriate exports text color based on tier
  const getExportsTextColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'text-green-600';
      case 'premium':
        return 'text-blue-600';
      case 'unlimited':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const planName = getPlanName(currentSubscription.tier);
  const backgroundColorClass = getBackgroundColor(currentSubscription.tier);
  const textColorClass = getTextColor(currentSubscription.tier);
  const iconColorClass = getIconColor(currentSubscription.tier);
  const exportsTextColorClass = getExportsTextColor(currentSubscription.tier);

  return (
    <div className={`${backgroundColorClass} border p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className={`h-5 w-5 ${iconColorClass} mr-2`} />
          <span className={`font-medium ${textColorClass}`}>
            {planName} Active
          </span>
        </div>
        <div className={`flex items-center ${exportsTextColorClass} font-medium`}>
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
