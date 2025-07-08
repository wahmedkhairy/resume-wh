
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface SubscriptionCardProps {
  subscription: any;
  onRefreshSubscription: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onRefreshSubscription }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Status
        </CardTitle>
        <CardDescription>Your subscription status and export credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription ? (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Exports Remaining</label>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {subscription.tier === 'unlimited' ? '∞' : subscription.scan_count || 0}
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
