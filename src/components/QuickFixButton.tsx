
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LiveSubscriptionDialog from "@/components/LiveSubscriptionDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickFixButtonProps {
  atsScore: number;
  isPremiumUser: boolean;
  canUseFix: boolean;
  onQuickFix: () => void;
  isProcessing?: boolean;
}

const QuickFixButton: React.FC<QuickFixButtonProps> = ({
  atsScore,
  isPremiumUser,
  canUseFix,
  onQuickFix,
  isProcessing = false
}) => {
  const { toast } = useToast();
  
  const shouldShowQuickFix = atsScore < 75;
  const projectedIncrease = Math.min(25, 90 - atsScore);

  if (!shouldShowQuickFix) return null;

  const handleClick = () => {
    if (!isPremiumUser) {
      toast({
        title: "Premium Feature",
        description: "Quick Fix is available with premium subscription.",
        variant: "destructive",
      });
      return;
    }

    if (!canUseFix) {
      toast({
        title: "Limit Reached",
        description: "You've reached your monthly fix limit.",
        variant: "destructive",
      });
      return;
    }

    onQuickFix();
  };

  if (!isPremiumUser) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <LiveSubscriptionDialog>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Quick Fix
                  <Crown className="ml-1 h-3 w-3" />
                </Button>
              </LiveSubscriptionDialog>
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 bg-orange-100 text-orange-700 text-xs"
              >
                +{projectedIncrease}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Premium feature: Instantly boost your ATS score by {projectedIncrease} points</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button 
              onClick={handleClick}
              disabled={isProcessing || !canUseFix}
              variant="outline" 
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              <Zap className="mr-1 h-3 w-3" />
              {isProcessing ? "Fixing..." : "Quick Fix"}
              <TrendingUp className="ml-1 h-3 w-3" />
            </Button>
            <Badge 
              variant="secondary" 
              className="absolute -top-2 -right-2 bg-green-100 text-green-700 text-xs"
            >
              +{projectedIncrease}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Instantly optimize your resume to boost ATS score by {projectedIncrease} points</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default QuickFixButton;
