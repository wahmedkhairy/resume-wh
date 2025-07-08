
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CheckCircle } from "lucide-react";

interface SubscriptionStatusCardProps {
  subscription?: {
    tier: string;
    status: string;
    expires_at?: string;
  } | null;
}

const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({ 
  subscription 
}) => {
  const isActive = subscription?.status === 'active';
  const isPremium = subscription?.tier === 'premium' || subscription?.tier === 'pro';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTierDisplayName = (tier?: string) => {
    switch (tier) {
      case 'premium':
      case 'pro':
        return 'Premium';
      case 'basic':
        return 'Basic';
      default:
        return 'Free';
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'premium':
      case 'pro':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'basic':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getTierColor(subscription?.tier)}`} />
            <span className="font-medium">
              {getTierDisplayName(subscription?.tier)}
            </span>
          </div>
          <Badge 
            variant={isActive ? "default" : "secondary"}
            className={isActive ? "bg-green-500" : ""}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {subscription?.expires_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {isActive ? 'Expires on' : 'Expired on'}: {formatDate(subscription.expires_at)}
            </span>
          </div>
        )}

        {isPremium && isActive && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800">
              🌟 Premium Benefits Active
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Unlimited exports, AI features, and priority support
            </p>
          </div>
        )}

        {!isPremium && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800">
              Upgrade to Premium
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Get unlimited exports and advanced features
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
