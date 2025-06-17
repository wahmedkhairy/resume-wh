
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

interface SubscriptionCardProps {
  subscription: any;
  onRefreshSubscription: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefreshSubscription }) => {
  // Helper function to get proper badge variant for subscription status
  const getSubscriptionStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>Your current plan and export credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Plan</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {subscription.tier}
                </Badge>
                <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Exports Remaining</label>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {subscription.tier === 'unlimited' ? '∞' : subscription.scan_count || 0}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Credits</label>
              <p className="text-sm mt-1">
                {subscription.tier === 'unlimited' ? 'Unlimited' : subscription.max_scans || 0}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No active subscription found.</p>
        )}
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onRefreshSubscription}>
            Refresh Subscription Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
