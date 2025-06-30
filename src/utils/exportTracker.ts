// Utility functions for export tracking functionality
// This replaces the visual ExportTracker component but keeps the logic

export interface ExportDetails {
  planName: string;
  totalExports: number;
  usedExports: number;
  remainingExports: number;
  isUnlimited: boolean;
}

export const getSubscriptionDetails = (currentSubscription: any): ExportDetails => {
  if (!currentSubscription) {
    return {
      planName: 'Free',
      totalExports: 0,
      usedExports: 0,
      remainingExports: 0,
      isUnlimited: false
    };
  }

  const isUnlimited = currentSubscription.tier === 'unlimited';
  const totalExports = isUnlimited ? 999 : (currentSubscription.max_scans || 0);
  const usedExports = isUnlimited ? 0 : Math.max(0, totalExports - (currentSubscription.scan_count || 0));
  const remainingExports = isUnlimited ? 999 : (currentSubscription.scan_count || 0);

  return {
    planName: currentSubscription.tier?.charAt(0).toUpperCase() + currentSubscription.tier?.slice(1) || 'Free',
    totalExports,
    usedExports,
    remainingExports,
    isUnlimited
  };
};

export const getPlanColor = (tier: string) => {
  switch (tier) {
    case 'unlimited':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    case 'premium':
      return 'bg-gradient-to-r from-blue-400 to-blue-600';
    case 'basic':
      return 'bg-gradient-to-r from-green-400 to-green-600';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

export const getUsagePercentage = (details: ExportDetails) => {
  if (details.isUnlimited) return 0;
  return details.totalExports > 0 ? (details.usedExports / details.totalExports) * 100 : 0;
};
