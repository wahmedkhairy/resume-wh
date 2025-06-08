
import React from "react";
import { Shield } from "lucide-react";

interface SubscriptionStatusProps {
  isPremiumUser: boolean;
  currentSubscription: any;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  isPremiumUser,
  currentSubscription,
}) => {
  if (!isPremiumUser || !currentSubscription) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-green-600 mr-2" />
          <span className="font-medium text-green-800">
            {currentSubscription.tier.charAt(0).toUpperCase() + currentSubscription.tier.slice(1)} Plan Active
          </span>
        </div>
        <span className="text-green-600 font-medium">
          {currentSubscription.scan_count} exports remaining
        </span>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
