
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, AlertCircle, Info, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LiveSubscriptionDialog from "./LiveSubscriptionDialog";

interface TailoredResumeGeneratorProps {
  resumeData: any;
  currentUserId: string;
  isPremiumUser: boolean;
  currentSubscription: any;
  onTailoredResumeGenerated: (tailoredData: any) => void;
}

const TailoredResumeGenerator: React.FC<TailoredResumeGeneratorProps> = ({
  resumeData,
  currentUserId,
  isPremiumUser,
  currentSubscription,
  onTailoredResumeGenerated,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useState<number | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showExportUpgradeDialog, setShowExportUpgradeDialog] = useState(false);
  const { toast } = useToast();

  // Get usage limits based on subscription tier
  const getUsageLimit = () => {
    if (!isPremiumUser || !currentSubscription) {
      return { limit: 1, isMonthly: true }; // Free users get 1 resume per month
    }
    
    switch (currentSubscription.tier) {
      case 'basic':
        return { limit: 2, isMonthly: true }; // Basic users get 2 resumes per month
      case 'premium':
        return { limit: 5, isMonthly: true }; // Premium users get 5 resumes per month
      case 'unlimited':
        return { limit: 999, isMonthly: true }; // Unlimited users get unlimited resumes
      default:
        return { limit: 1, isMonthly: true };
    }
  };

  const canExportResume = () => {
    // Free users cannot export
    if (!isPremiumUser || !currentSubscription) return false;
    
    // All paid users can export
    return true;
  };

  const checkUsageLimit = async () => {
    try {
      const { data: usage } = await supabase
        .from('tailoring_usage')
        .select('monthly_count')
        .eq('user_id', currentUserId)
        .maybeSingle();
      
      const currentMonthlyUsage = usage?.monthly_count || 0;
      setMonthlyUsage(currentMonthlyUsage);
      return { monthly: currentMonthlyUsage };
    } catch (error) {
      console.error('Error checking usage:', error);
      return { monthly: 0 };
    }
  };

  React.useEffect(() => {
    if (currentUserId) {
      checkUsageLimit();
    }
  }, [currentUserId]);

  const handleGenerateTargetedResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description to create your targeted resume.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the targeted resume feature.",
        variant: "destructive",
      });
      return;
    }

    const usage = await checkUsageLimit();
    const usageConfig = getUsageLimit();
    const currentUsageCount = usage.monthly;

    if (currentUsageCount >= usageConfig.limit) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your monthly limit of ${usageConfig.limit === 999 ? "unlimited" : usageConfig.limit} targeted resumes. Your limit will reset next month.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Starting targeted resume generation process...');

      // Call the edge function to generate targeted resume
      const { data, error } = await supabase.functions.invoke('tailor-resume', {
        body: {
          resumeData,
          jobDescription,
          userId: currentUserId,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate targeted resume');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate targeted resume');
      }

      // Update usage count
      const { error: usageError } = await supabase.rpc('increment_tailoring_usage', {
        user_uuid: currentUserId
      });

      if (usageError) {
        console.error('Error updating usage:', usageError);
      }

      // Store the targeted resume
      const { error: storeError } = await supabase
        .from('tailored_resumes')
        .insert([
          {
            user_id: currentUserId,
            job_description: jobDescription,
            tailored_content: data.tailoredContent,
            original_content: data.originalContent,
          },
        ]);

      if (storeError) {
        console.error('Error storing targeted resume:', storeError);
        // Don't throw here as the generation was successful
      }

      // Update usage counts in UI
      const newUsage = await checkUsageLimit();

      // Pass the targeted data to parent component
      onTailoredResumeGenerated(data.tailoredContent);

      const remainingCount = usageConfig.limit === 999 ? "unlimited" : (usageConfig.limit - newUsage.monthly);

      toast({
        title: "Targeted Resume Created Successfully!",
        description: `Your resume has been customized for this job. ${remainingCount === "unlimited" ? "Unlimited resumes remaining." : `${remainingCount} targeted resumes remaining this month.`}`,
      });

      // Clear the job description after successful generation
      setJobDescription("");

    } catch (error) {
      console.error('Error generating targeted resume:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error creating your targeted resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgradeClick = () => {
    console.log('TailoredResumeGenerator: Upgrade button clicked');
    setShowUpgradeDialog(true);
  };

  const handleExportUpgradeClick = () => {
    console.log('TailoredResumeGenerator: Export upgrade button clicked');
    setShowExportUpgradeDialog(true);
  };

  const usageConfig = getUsageLimit();
  const currentUsageCount = monthlyUsage || 0;
  const remainingUses = Math.max(0, usageConfig.limit - currentUsageCount);
  const canGenerate = remainingUses > 0 || usageConfig.limit === 999;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Targeted Job Resume Generator
            {isPremiumUser && currentSubscription && (
              <Badge variant="secondary" className="ml-auto">
                {currentSubscription.tier} Plan
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Generate a customized version of your resume targeted to a specific job description.
            Our AI will analyze the job requirements and emphasize your most relevant experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isPremiumUser && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Free users can generate 1 targeted resume. To export your targeted resume as PDF 
                and get more generations, please upgrade to a plan.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                Monthly Usage:
              </span>
              <Badge variant={canGenerate ? "default" : "destructive"}>
                {currentUsageCount} / {usageConfig.limit === 999 ? "∞" : usageConfig.limit}
              </Badge>
            </div>
            <Badge variant="outline">
              {usageConfig.limit === 999 ? "Unlimited" : `${remainingUses} remaining`}
            </Badge>
          </div>

          {!canExportResume() && (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Upgrade to a plan to export your targeted resumes as PDF or Word document.</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-4"
                    onClick={handleExportUpgradeClick}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="job-description" className="text-sm font-medium">
              Job Description *
            </label>
            <Textarea
              id="job-description"
              placeholder="Paste the full job description here. Include requirements, responsibilities, and desired qualifications for best results..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Include the complete job posting for better targeting results.
            </p>
          </div>

          {canGenerate ? (
            <Button
              onClick={handleGenerateTargetedResume}
              disabled={isGenerating || !jobDescription.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Targeted Resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Custom Resume for This Job
                </>
              )}
            </Button>
          ) : (
            <Button 
              className="w-full opacity-75"
              onClick={handleUpgradeClick}
            >
              <Crown className="mr-2 h-4 w-4" />
              🔒 Upgrade to Generate More Resumes
            </Button>
          )}

          {!canGenerate && usageConfig.limit !== 999 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your monthly limit. Your limit will reset next month or upgrade for more targeted resumes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {showUpgradeDialog && (
        <LiveSubscriptionDialog>
          <div />
        </LiveSubscriptionDialog>
      )}

      {showExportUpgradeDialog && (
        <LiveSubscriptionDialog>
          <div />
        </LiveSubscriptionDialog>
      )}
    </>
  );
};

export default TailoredResumeGenerator;
