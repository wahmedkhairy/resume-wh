
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SummaryEditorProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  onSummaryChange,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { 
          prompt: "Generate a professional summary for a resume based on general software engineering experience" 
        }
      });

      if (error) throw error;

      if (data?.generatedText) {
        onSummaryChange(data.generatedText);
        toast({
          title: "Summary Generated",
          description: "AI has generated a professional summary for you.",
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
        <CardDescription>
          Generate your professional summary using AI by clicking the 'Generate Summary' button.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Write a compelling professional summary that highlights your experience, skills, and career objectives. Example: 'Results-driven software engineer with 5+ years of experience in developing scalable web applications...'"
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            className="min-h-[120px]"
          />
          
          <Button 
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            variant="outline"
            className="w-full"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Summary"}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Tip: Include your years of experience, key skills, and what you're looking for in your next role.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryEditor;
