
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TailoredResumeSectionProps {
  onTailoredResumeGenerated: (tailoredData: any) => void;
  currentUserId: string;
  isPremiumUser: boolean;
  resumeData: any;
  sessionId: string;
}

const TailoredResumeSection: React.FC<TailoredResumeSectionProps> = ({
  onTailoredResumeGenerated,
  currentUserId,
  isPremiumUser,
  resumeData,
  sessionId,
}) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateTailoredResume = () => {
    toast({
      title: "Feature Coming Back Soon",
      description: "Targeted resume generation will be available again shortly!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">🎯 Targeted Job Resume</h2>
        <p className="text-lg text-muted-foreground">
          Generate a targeted resume optimized for specific job postings with AI-powered customization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create Targeted Resume
          </CardTitle>
          <CardDescription>
            Paste a job description below and we'll optimize your resume to match the requirements and keywords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here. Include requirements, responsibilities, and any specific skills mentioned..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Coming Back Soon</span>
            </div>
            
            <Button
              onClick={handleGenerateTailoredResume}
              disabled={true}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Coming Back Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TailoredResumeSection;
