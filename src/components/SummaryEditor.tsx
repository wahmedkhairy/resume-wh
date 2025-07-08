
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SummaryEditorProps {
  initialSummary?: string;
  onSummaryChange: (summary: string) => void;
  workExperience?: any[];
  education?: any[];
  skills?: any[];
  personalInfo?: any;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({
  initialSummary = "",
  onSummaryChange,
  workExperience = [],
  education = [],
  skills = [],
  personalInfo = {}
}) => {
  const [summary, setSummary] = useState(initialSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  const handleSummaryChange = (value: string) => {
    setSummary(value);
    onSummaryChange(value);
  };

  const handleGenerateWithAI = () => {
    toast({
      title: "Feature Coming Back Soon",
      description: "AI-powered summary generation will be available again shortly!",
    });
  };

  const wordCount = summary.split(/\s+/).filter(word => word.length > 0).length;
  const recommendedRange = "80-120 words";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Professional Summary
        </CardTitle>
        <CardDescription>
          Write a compelling professional summary that highlights your key achievements and career objectives.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Professional Summary</span>
            <div className="flex items-center gap-2">
              <Badge variant={wordCount >= 80 && wordCount <= 120 ? "default" : "secondary"}>
                {wordCount} words
              </Badge>
              <span className="text-xs text-muted-foreground">
                Recommended: {recommendedRange}
              </span>
            </div>
          </div>
          <Textarea
            placeholder="Write a compelling professional summary that showcases your experience, skills, and career goals. This should be 3-4 sentences highlighting your unique value proposition."
            value={summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button
            onClick={handleGenerateWithAI}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Coming Back Soon
          </Button>
          
          {wordCount < 80 && (
            <p className="text-sm text-amber-600">
              Consider adding more details to reach the recommended word count
            </p>
          )}
          {wordCount > 120 && (
            <p className="text-sm text-amber-600">
              Consider condensing your summary for better impact
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryEditor;
