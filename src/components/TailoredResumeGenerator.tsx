import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please paste a job description to generate a targeted resume.",
        variant: "destructive",
      });
      return;
    }

    if (!resumeData) {
      toast({
        title: "No resume data",
        description: "Please create your resume first before generating a targeted version.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('tailor-resume', {
        body: {
          resumeData,
          jobDescription: jobDescription.trim(),
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate targeted resume');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to generate targeted resume');
      }

      toast({
        title: "Success!",
        description: "Your targeted resume has been generated.",
      });

      onTailoredResumeGenerated(data.tailoredContent);
    } catch (error: any) {
      console.error('Error generating targeted resume:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate targeted resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-Powered Resume Targeting
          </CardTitle>
          <CardDescription>
            Our AI analyzes job requirements and optimizes your resume content to match perfectly with the target position.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here to get a targeted resume optimized for this specific position..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="mt-2"
              disabled={isGenerating}
            />
          </div>
          
          <Button 
            variant="default"
            disabled={isGenerating || !jobDescription.trim()}
            className="w-full"
            onClick={handleGenerateResume}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Targeted Resume...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Targeted Resume
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="text-xs text-muted-foreground text-center">
              <p>This may take 10-30 seconds. Our AI is analyzing the job description and tailoring your resume...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TailoredResumeGenerator;
