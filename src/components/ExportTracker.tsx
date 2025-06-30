
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Crown, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ExportTrackerProps {
  currentUserId: string;
  currentSubscription: any;
  isPremiumUser: boolean;
}

const ExportTracker: React.FC<ExportTrackerProps> = ({
  currentUserId,
  currentSubscription,
  isPremiumUser
}) => {
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUserId) {
      fetchExportHistory();
    }
  }, [currentUserId]);

  const fetchExportHistory = async () => {
    try {
      setIsLoading(true);
      
      // Get export history from subscription updates
      const { data: history, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUserId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setExportHistory(history || []);
    } catch (error) {
      console.error('Error fetching export history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscriptionDetails = () => {
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

  const getPlanColor = (tier: string) => {
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

  const getUsagePercentage = () => {
    const details = getSubscriptionDetails();
    if (details.isUnlimited) return 0;
    return details.totalExports > 0 ? (details.usedExports / details.totalExports) * 100 : 0;
  };

  const details = getSubscriptionDetails();
  const usagePercentage = getUsagePercentage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-500" />
          Export Usage Tracker
          <Badge 
            className={`ml-auto text-white ${getPlanColor(currentSubscription?.tier || 'demo')}`}
          >
            {details.planName} Plan
          </Badge>
        </CardTitle>
        <CardDescription>
          Track your resume export usage and subscription limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Overview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Export Usage</span>
            <span className="text-sm text-muted-foreground">
              {details.isUnlimited ? 'Unlimited' : `${details.usedExports} / ${details.totalExports}`}
            </span>
          </div>
          
          {!details.isUnlimited && (
            <Progress value={usagePercentage} className="h-2" />
          )}
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {details.isUnlimited ? '∞' : details.remainingExports}
              </div>
              <div className="text-xs text-muted-foreground">Remaining</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {details.isUnlimited ? '0' : details.usedExports}
              </div>
              <div className="text-xs text-muted-foreground">Used</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {details.isUnlimited ? '∞' : details.totalExports}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Your Plan Features
          </h4>
          <div className="space-y-2 text-sm">
            {currentSubscription?.tier === 'unlimited' && (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <Crown className="h-4 w-4" />
                  Unlimited PDF & Word exports
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Crown className="h-4 w-4" />
                  Unlimited targeted resumes
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Crown className="h-4 w-4" />
                  Priority support
                </div>
              </>
            )}
            {currentSubscription?.tier === 'premium' && (
              <>
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  6 PDF & Word exports
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  3 targeted resumes per month
                </div>
              </>
            )}
            {currentSubscription?.tier === 'basic' && (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-4 w-4" />
                  2 PDF & Word exports
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <FileText className="h-4 w-4" />
                  1 targeted resume per month
                </div>
              </>
            )}
            {(!currentSubscription || currentSubscription?.tier === 'demo') && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                Upgrade to unlock export features
              </div>
            )}
          </div>
        </div>

        {/* Usage Warning */}
        {!details.isUnlimited && usagePercentage > 80 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {usagePercentage >= 100 ? 'Export limit reached!' : 'Running low on exports'}
              </span>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {usagePercentage >= 100 
                ? 'Upgrade your plan to continue exporting resumes.'
                : 'Consider upgrading to avoid interruption.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportTracker;
