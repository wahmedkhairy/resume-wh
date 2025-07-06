
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface SubscriptionStatusProps {
  remainingExports: number;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ remainingExports }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Subscription Status</span>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {remainingExports} exports remaining
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatus;
