import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Wand2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import WritingStyleSelector from "./WritingStyleSelector";

interface SectionEditorProps {
  title: string;
  description: string;
  placeholder: string;
  initialContent: string;
  sectionType?: "summary" | "experience" | "education" | "skills" | "courses" | "certifications";
  onContentChange?: (content: string) => void;
  workExperience?: any[];
  showAIGenerateButton?: boolean;
  showWritingStyleSelector?: boolean;
  writingStyle?: "bullet" | "paragraph";
  onWritingStyleChange?: (style: "bullet" | "paragraph") => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  title,
  description,
  placeholder,
  initialContent,
  sectionType = "summary",
  onContentChange,
  workExperience = [],
  showAIGenerateButton = false,
  showWritingStyleSelector = false,
  writingStyle = "paragraph",
  onWritingStyleChange,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newContent = e.target.value;
    
    // Handle bullet point formatting if bullet style is selected
    if (showWritingStyleSelector && writingStyle === "bullet") {
      const lines = newContent.split('\n');
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("• ")) {
          return `• ${trimmedLine}`;
        }
        return line;
      });
      newContent = formattedLines.join('\n');
    }
    
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const getFormattedContent = () => {
    if (showWritingStyleSelector && writingStyle === "bullet" && content && !content.includes("• ")) {
      return `• ${content}`;
    }
    return content;
  };

  const getPlaceholderText = () => {
    if (showWritingStyleSelector && writingStyle === "bullet") {
      return "• Write your first point here\n• Add another key point\n• Include specific achievements or skills";
    }
    return placeholder;
  };

  const handleAIPolish = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty Content",
        description: "Please add some content to polish.",
        variant: "destructive",
      });
      return;
    }

    setIsPolishing(true);

    try {
      console.log('Calling polish-resume edge function with:', { content, sectionType });
      
      const { data, error } = await supabase.functions.invoke('polish-resume', {
        body: { 
          content, 
          sectionType: sectionType === "courses" || sectionType === "certifications" ? "courses-certifications" : sectionType
        }
      });

      console.log('Polish response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to polish content');
      }

      if (data?.polishedContent) {
        setContent(data.polishedContent);
        if (onContentChange) {
          onContentChange(data.polishedContent);
        }
        toast({
          title: "Content Polished",
          description: "Your content has been enhanced with AI.",
          variant: "default",
        });
      } else if (data?.polishedItems) {
        // Handle courses and certifications response
        const polishedContent = JSON.stringify(data.polishedItems, null, 2);
        setContent(polishedContent);
        if (onContentChange) {
          onContentChange(polishedContent);
        }
        toast({
          title: "Content Polished",
          description: "Your courses and certifications have been enhanced with AI.",
          variant: "default",
        });
      } else {
        throw new Error('No polished content received from AI service');
      }
    } catch (error) {
      console.error('Error polishing content:', error);
      
      toast({
        title: "Polishing Failed",
        description: error.message || "There was an error polishing your content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPolishing(false);
    }
  };

  const handleAIGenerate = async () => {
    if (sectionType !== "summary" || workExperience.length === 0) {
      toast({
        title: "Cannot Generate",
        description: "AI generation is only available for summary section and requires work experience.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Calling polish-resume edge function for summary generation');
      
      const experienceText = workExperience
        .map(exp => `${exp.jobTitle} at ${exp.company}: ${exp.responsibilities.join(', ')}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('polish-resume', {
        body: { 
          content: experienceText,
          action: "generate-summary"
        }
      });

      console.log('Generate summary response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate summary');
      }

      if (data?.summary) {
        setContent(data.summary);
        if (onContentChange) {
          onContentChange(data.summary);
        }
        toast({
          title: "Summary Generated",
          description: "Your professional summary has been generated with AI.",
          variant: "default",
        });
      } else {
        throw new Error('No summary received from AI service');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error generating your summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Empty Content",
        description: "Cannot save empty content.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // In a real implementation, this would save to your database
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Content Saved",
        description: "Your content has been saved successfully.",
        variant: "default",
      });
    }, 500);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showWritingStyleSelector && onWritingStyleChange && (
          <div className="mb-4">
            <WritingStyleSelector
              value={writingStyle}
              onChange={onWritingStyleChange}
            />
          </div>
        )}
        <Textarea
          placeholder={getPlaceholderText()}
          className="min-h-[150px] font-mono text-sm"
          value={getFormattedContent()}
          onChange={handleContentChange}
          style={{
            fontFamily: showWritingStyleSelector && writingStyle === "bullet" ? "monospace" : "inherit"
          }}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAIPolish}
            disabled={isPolishing}
            className="relative"
          >
            {isPolishing && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
              </span>
            )}
            <Wand2 className="mr-1 h-4 w-4" /> 
            {isPolishing ? "Polishing..." : "Polish with AI"}
          </Button>

          {showAIGenerateButton && sectionType === "summary" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="relative"
            >
              {isGenerating && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
                </span>
              )}
              <Sparkles className="mr-1 h-4 w-4" /> 
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <CheckCircle className="mr-1 h-4 w-4 text-green-500" /> 
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SectionEditor;
