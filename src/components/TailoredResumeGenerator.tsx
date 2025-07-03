
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, AlertCircle, Info, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TailoredResumeInstructions from "./TailoredResumeInstructions";

interface TailoredResumeGeneratorProps {
  resumeData: any;
  currentUserId: string;
  isPremiumUser: boolean;
  currentSubscription: any;
  canAccessTargetedResumes: boolean;
  onTailoredResumeGenerated: (tailoredData: any) => void;
}

const TailoredResumeGenerator: React.FC<TailoredResumeGeneratorProps> = ({
  resumeData,
  currentUserId,
  isPremiumUser,
  currentSubscription,
  canAccessTargetedResumes,
  onTailoredResumeGenerated,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetedResumeUsage, setTargetedResumeUsage] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if resume data is complete
  const isResumeComplete = () => {
    return (
      resumeData.personalInfo?.name &&
      resumeData.personalInfo?.email &&
      resumeData.workExperience?.length > 0 &&
      resumeData.education?.length > 0
    );
  };

  // Get usage limits based on subscription tier - FIXED to be one-time limits
  const getTargetedResumeLimit = () => {
    if (!canAccessTargetedResumes || !currentSubscription) {
      return { limit: 0, isOneTime: true };
    }
    
    switch (currentSubscription.tier) {
      case 'basic':
        return { limit: 1, isOneTime: true }; // 1 targeted resume total
      case 'premium':
        return { limit: 3, isOneTime: true }; // 3 targeted resumes total
      case 'unlimited':
        return { limit: 999, isOneTime: true }; // Unlimited targeted resumes
      default:
        return { limit: 0, isOneTime: true };
    }
  };

  const canExportResume = () => {
    // Free users cannot export
    if (!canAccessTargetedResumes || !currentSubscription) return false;
    
    // All paid users can export
    return true;
  };

  const checkTargetedResumeUsage = async () => {
    try {
      const { data: tailoredResumes } = await supabase
        .from('tailored_resumes')
        .select('id')
        .eq('user_id', currentUserId);
      
      const currentUsage = tailoredResumes?.length || 0;
      setTargetedResumeUsage(currentUsage);
      return currentUsage;
    } catch (error) {
      console.error('Error checking targeted resume usage:', error);
      return 0;
    }
  };

  React.useEffect(() => {
    if (currentUserId) {
      checkTargetedResumeUsage();
    }
  }, [currentUserId]);

  const handleGenerateTargetedResume = async () => {
    if (!isResumeComplete()) {
      toast({
        title: "Incomplete Resume Information",
        description: "Please complete your personal information, work experience, and education sections first.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a complete job description to create your targeted resume.",
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

    const currentUsage = await checkTargetedResumeUsage();
    const usageConfig = getTargetedResumeLimit();

    if (currentUsage >= usageConfig.limit) {
      toast({
        title: "Usage Limit Reached",
        description: `You've reached your limit of ${usageConfig.limit === 999 ? "unlimited" : usageConfig.limit} targeted resumes. Please upgrade your plan for more.`,
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
      }

      const newUsage = await checkTargetedResumeUsage();
      onTailoredResumeGenerated(data.tailoredContent);

      const remainingCount = usageConfig.limit === 999 ? "unlimited" : (usageConfig.limit - newUsage);

      toast({
        title: "Targeted Resume Created Successfully!",
        description: `Your resume has been customized for this job. ${remainingCount === "unlimited" ? "Unlimited resumes remaining." : `${remainingCount} targeted resumes remaining.`}`,
      });

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
    console.log('TailoredResumeGenerator: Upgrade button clicked - navigating to subscription page');
    navigate("/subscription");
  };

  const usageConfig = getTargetedResumeLimit();
  const currentUsageCount = targetedResumeUsage || 0;
  const remainingUses = Math.max(0, usageConfig.limit - currentUsageCount);
  const canGenerate = remainingUses > 0 || usageConfig.limit === 999;

  return (
    <div className="space-y-6">
      <TailoredResumeInstructions />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI-Powered Resume Targeting
            {canAccessTargetedResumes && currentSubscription && (
              <Badge variant="secondary" className="ml-auto">
                {currentSubscription.tier} Plan
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Our AI analyzes job requirements and optimizes your resume content to match perfectly with the target position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canAccessTargetedResumes && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Free users need to upgrade to generate targeted resumes. Upgrade to unlock AI-powered resume targeting and PDF exports.
              </AlertDescription>
            </Alert>
          )}

          {!isResumeComplete() && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please complete your resume information first:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {!resumeData.personalInfo?.name && <li>Add your personal information</li>}
                  {!resumeData.personalInfo?.email && <li>Add your email address</li>}
                  {!resumeData.workExperience?.length && <li>Add at least one work experience</li>}
                  {!resumeData.education?.length && <li>Add your education background</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="job-description" className="text-sm font-medium">
              Complete Job Description *
            </label>
            <Textarea
              id="job-description"
              placeholder="Paste the complete job posting here including:
• Job title and company name
• Key responsibilities and requirements
• Required skills and qualifications
• Preferred experience and education
• Any specific technologies or tools mentioned

The more complete the job description, the better our AI can tailor your resume!"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>💡 Include the complete job posting for best results</span>
              <span>{jobDescription.length} characters</span>
            </div>
          </div>

          {canGenerate && isResumeComplete() ? (
            <Button
              onClick={handleGenerateTargetedResume}
              disabled={isGenerating || !jobDescription.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI is analyzing and tailoring your resume...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI-Targeted Resume
                </>
              )}
            </Button>
          ) : (
            <Button 
              className="w-full opacity-75"
              onClick={handleUpgradeClick}
              disabled={!isResumeComplete()}
            >
              <Crown className="mr-2 h-4 w-4" />
              🔒 Upgrade to Generate Targeted Resumes
            </Button>
          )}

          {!canGenerate && usageConfig.limit !== 999 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your limit of {usageConfig.limit} targeted resumes. Please upgrade for more.
              </AlertDescription>
            </Alert>
          )}

          {canAccessTargetedResumes && (
            <div className="text-xs text-muted-foreground text-center">
              {usageConfig.limit === 999 
                ? "Unlimited targeted resumes remaining" 
                : `${remainingUses} targeted resumes remaining`
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TailoredResumeGenerator;
