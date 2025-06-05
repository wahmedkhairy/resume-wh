
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSummaryChange = (value: string) => {
    setSummary(value);
    onSummaryChange(value);
  };

  const handleGenerateWithAI = async () => {
    if (workExperience.length === 0) {
      toast({
        title: "No Experience Data",
        description: "Please add work experience details first to generate a relevant summary.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { 
          experience: workExperience,
          education: education,
          skills: skills,
          personalInfo: personalInfo
        }
      });
      
      if (error) throw error;
      
      if (data?.summary) {
        const generatedSummary = data.summary;
        setSummary(generatedSummary);
        onSummaryChange(generatedSummary);
        toast({
          title: "Summary Generated",
          description: "Your professional summary has been generated using AI.",
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your summary. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="summary">Write your professional summary</Label>
          <Textarea
            id="summary"
            placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
            value={summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            className="min-h-[150px] mt-2"
          />
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleGenerateWithAI} 
          disabled={isGenerating}
          className="w-full"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate with AI"}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p>Tip: A good summary should be 2-3 sentences that highlight your most relevant experience and skills for your target role.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryEditor;
