
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, AlertCircle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubscriptionDialog from "./SubscriptionDialog";

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
  const { toast } = useToast();

  // Usage limits based on subscription tier
  const getUsageLimit = () => {
    if (!isPremiumUser || !currentSubscription) return 0; // Free users get 0 tailored resumes
    
    switch (currentSubscription.tier) {
      case 'basic':
        return 5; // Basic users get 5 tailored resumes per month
      case 'premium':
        return 15; // Premium users get 15 tailored resumes per month
      case 'unlimited':
        return 999; // Unlimited users get unlimited tailored resumes
      default:
        return 0;
    }
  };

  const checkUsageLimit = async () => {
    try {
      const { data: usage } = await supabase
        .from('tailoring_usage')
        .select('monthly_count')
        .eq('user_id', currentUserId)
        .maybeSingle();
      
      const currentUsage = usage?.monthly_count || 0;
      setMonthlyUsage(currentUsage);
      return currentUsage;
    } catch (error) {
      console.error('Error checking usage:', error);
      return 0;
    }
  };

  React.useEffect(() => {
    if (currentUserId) {
      checkUsageLimit();
    }
  }, [currentUserId]);

  const handleGenerateTailoredResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description to tailor your resume.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the resume tailoring feature.",
        variant: "destructive",
      });
      return;
    }

    if (!isPremiumUser || !currentSubscription) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade to a paid plan to use the resume tailoring feature.",
        variant: "destructive",
      });
      return;
    }

    const currentUsage = await checkUsageLimit();
    const usageLimit = getUsageLimit();

    if (currentUsage >= usageLimit) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your monthly limit of ${usageLimit} tailored resumes. Your limit will reset next month.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Starting resume tailoring process...');

      // Call the edge function to generate tailored resume
      const { data, error } = await supabase.functions.invoke('tailor-resume', {
        body: {
          resumeData,
          jobDescription,
          userId: currentUserId,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate tailored resume');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate tailored resume');
      }

      // Increment usage count
      const { error: usageError } = await supabase.rpc('increment_tailoring_usage', {
        user_uuid: currentUserId
      });

      if (usageError) {
        console.error('Error updating usage:', usageError);
      }

      // Store the tailored resume
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
        console.error('Error storing tailored resume:', storeError);
        // Don't throw here as the generation was successful
      }

      // Update usage count in UI
      setMonthlyUsage(currentUsage + 1);

      // Pass the tailored data to parent component
      onTailoredResumeGenerated(data.tailoredContent);

      toast({
        title: "Resume Tailored Successfully!",
        description: `Your resume has been customized for this job. ${getUsageLimit() - (currentUsage + 1)} tailored resumes remaining this month.`,
      });

      // Clear the job description after successful generation
      setJobDescription("");

    } catch (error) {
      console.error('Error generating tailored resume:', error);
      toast({
        title: "Tailoring Failed",
        description: error.message || "There was an error tailoring your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const usageLimit = getUsageLimit();
  const remainingUses = Math.max(0, usageLimit - (monthlyUsage || 0));

  // Show upgrade prompt for free users
  if (!isPremiumUser || !currentSubscription) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Premium Feature: Tailored Resume Generator
          </CardTitle>
          <CardDescription>
            Generate customized versions of your resume tailored to specific job descriptions.
            Our AI analyzes job requirements and emphasizes your most relevant experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              The resume tailoring feature is available to premium subscribers only. 
              Upgrade to access AI-powered resume customization with different monthly limits based on your plan.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Basic Plan</h4>
                <p className="text-muted-foreground">5 tailored resumes/month</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Premium Plan</h4>
                <p className="text-muted-foreground">15 tailored resumes/month</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">Unlimited Plan</h4>
                <p className="text-muted-foreground">Unlimited tailored resumes</p>
              </div>
            </div>

            <SubscriptionDialog>
              <Button className="w-full" size="lg">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </SubscriptionDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Tailored Resume Generator
          <Badge variant="secondary" className="ml-auto">
            {currentSubscription.tier} Plan
          </Badge>
        </CardTitle>
        <CardDescription>
          Generate a customized version of your resume tailored to a specific job description.
          Our AI will analyze the job requirements and emphasize your most relevant experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Monthly Usage:</span>
            <Badge variant={remainingUses > 0 ? "default" : "destructive"}>
              {monthlyUsage || 0} / {usageLimit === 999 ? "∞" : usageLimit}
            </Badge>
          </div>
          <Badge variant="outline">
            {usageLimit === 999 ? "Unlimited" : `${remainingUses} remaining`}
          </Badge>
        </div>

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
            Tip: Include the complete job posting for better tailoring results.
          </p>
        </div>

        <Button
          onClick={handleGenerateTailoredResume}
          disabled={isGenerating || !jobDescription.trim() || remainingUses <= 0}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tailoring Resume...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Tailored Resume
            </>
          )}
        </Button>

        {remainingUses <= 0 && usageLimit !== 999 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached your monthly limit. Your limit will reset next month or upgrade for more tailored resumes.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TailoredResumeGenerator;
