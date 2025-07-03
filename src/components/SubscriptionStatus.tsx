import React from 'react';
import { Crown, CheckCircle, XCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  subscription: any;
  loading: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  loading
}) => {
  // Format plan name with proper capitalization
  const formatPlanName = (tier: string): string => {
    if (!tier) return 'Free';
    
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'Basic';
      case 'premium':
        return 'Premium';
      case 'unlimited':
        return 'Unlimited';
      case 'demo':
        return 'Demo';
      default:
        return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
    }
  };

  // Get plan limits based on tier
  const getPlanLimits = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return { exports: 2, targetedResumes: 1 };
      case 'premium':
        return { exports: 6, targetedResumes: 3 };
      case 'unlimited':
        return { exports: 999, targetedResumes: 'unlimited' };
      case 'demo':
        return { exports: 1, targetedResumes: 0 };
      default:
        return { exports: 0, targetedResumes: 0 };
    }
  };

  // Get plan color based on tier
  const getPlanColor = (tier: string): string => {
    switch (tier?.toLowerCase()) {
      case 'basic':
        return 'text-blue-600 bg-blue-50';
      case 'premium':
        return 'text-purple-600 bg-purple-50';
      case 'unlimited':
        return 'text-gold-600 bg-yellow-50';
      case 'demo':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <XCircle className="text-red-500" size={20} />
          <h2 className="text-xl font-bold text-gray-800">No Active Subscription</h2>
        </div>
        <p className="text-gray-600 mb-4">
          You don't have an active subscription. Upgrade to access premium features.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          View Plans
        </button>
      </div>
    );
  }

  const planName = formatPlanName(subscription.tier);
  const planLimits = getPlanLimits(subscription.tier);
  const planColorClass = getPlanColor(subscription.tier);
  const remainingExports = subscription.scan_count || 0;
  const usedExports = planLimits.exports - remainingExports;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Crown className="text-yellow-500" size={20} />
        <h2 className="text-xl font-bold text-gray-800">Subscription Status</h2>
      </div>

      <div className="space-y-4">
        {/* Plan Name */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Current Plan:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${planColorClass}`}>
            {planName}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status:</span>
          <div className="flex items-center space-x-1">
            <CheckCircle className="text-green-500" size={16} />
            <span className="text-green-600 font-medium">Active</span>
          </div>
        </div>

        {/* Export Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Resume Exports:</span>
            <span className="text-gray-800 font-medium">
              {usedExports}/{planLimits.exports === 999 ? '∞' : planLimits.exports}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: planLimits.exports === 999 ? '100%' : `${(usedExports / planLimits.exports) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {remainingExports} exports remaining
          </p>
        </div>

        {/* Targeted Resumes */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Targeted Resumes:</span>
          <span className="text-gray-800 font-medium">
            {planLimits.targetedResumes === 'unlimited' ? 'Unlimited' : planLimits.targetedResumes}
          </span>
        </div>

        {/* Additional Features */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Plan Features:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={14} />
              <span>AI-powered resume optimization</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={14} />
              <span>Multiple resume templates</span>
            </li>
            {planLimits.targetedResumes > 0 && (
              <li className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={14} />
                <span>Targeted job resume generation</span>
              </li>
            )}
            {subscription.tier === 'unlimited' && (
              <li className="flex items-center space-x-2">
                <CheckCircle className="text-green-500" size={14} />
                <span>Priority support</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;