
import React from "react";
import EnhancedSubscriptionTiers from "./EnhancedSubscriptionTiers";

interface SubscriptionTiersProps {
  onSubscriptionSelect: (tier: string) => void;
}

const SubscriptionTiers: React.FC<SubscriptionTiersProps> = ({ onSubscriptionSelect }) => {
  return <EnhancedSubscriptionTiers onSubscriptionSelect={onSubscriptionSelect} />;
};

export default SubscriptionTiers;
