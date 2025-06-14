
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TailoredResumeGeneratorProps {
  resumeData: any;
  currentUserId: string;
  isPremiumUser: boolean;
  onTailoredResumeGenerated: (tailoredData: any) => void;
}

const TailoredResumeGenerator: React.FC<TailoredResumeGeneratorProps> = ({
  resumeData,
  currentUserId,
  isPremiumUser,
  onTailoredResumeGenerated,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [monthlyUsage, setMonthlyUsage] = useState<number | null>(null);
  const { toast } = useToast();

  // Usage limits based on subscription tier
  const getUsageLimit = () => {
    if (isPremiumUser) return 10; // Premium users get 10 tailored resumes per month
    return 2; // Free users get 2 tailored resumes per month
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

    const currentUsage = await checkUsageLimit();
    const usageLimit = getUsageLimit();

    if (currentUsage >= usageLimit) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your monthly limit of ${usageLimit} tailored resumes. ${isPremiumUser ? 'Your limit will reset next month.' : 'Upgrade to Premium for more tailored resumes.'}`,
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Tailored Resume Generator
        </CardTitle>
        <CardDescription>
          Generate a customized version of your resume tailored to a specific job description.
          Our AI will analyze the job requirements and emphasize your most relevant experience.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPremiumUser && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Free users get {usageLimit} tailored resumes per month. Upgrade to Premium for more customizations.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Monthly Usage:</span>
            <Badge variant={remainingUses > 0 ? "default" : "destructive"}>
              {monthlyUsage || 0} / {usageLimit}
            </Badge>
          </div>
          <Badge variant="outline">
            {remainingUses} remaining
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

        {remainingUses <= 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached your monthly limit. {isPremiumUser ? 'Your limit will reset next month.' : 'Upgrade to Premium for more tailored resumes.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TailoredResumeGenerator;
