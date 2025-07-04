
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
  // Don't show anything if there's no subscription
  if (!currentSubscription) {
    return null;
  }

  // Don't show for demo tier users
  if (currentSubscription.tier === 'demo') {
    return null;
  }

  const tier = currentSubscription.tier;
  const isUnlimited = tier === 'unlimited';
  
  // Calculate remaining exports
  let remainingExports;
  if (getRemainingExports) {
    remainingExports = getRemainingExports();
  } else {
    remainingExports = isUnlimited ? 999 : (currentSubscription.scan_count || 0);
  }

  // Define tier configurations
  const tierConfig = {
    basic: {
      name: 'Basic Plan',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      exportsColor: 'text-green-600'
    },
    premium: {
      name: 'Premium Plan',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      exportsColor: 'text-blue-600'
    },
    unlimited: {
      name: 'Unlimited Plan',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
      exportsColor: 'text-yellow-600'
    }
  };

  // Get current tier config or default to basic
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border p-4 rounded-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className={`h-5 w-5 ${config.iconColor} mr-2`} />
          <span className={`font-medium ${config.textColor}`}>
            {config.name} Active
          </span>
        </div>
        <div className={`flex items-center ${config.exportsColor} font-medium`}>
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
