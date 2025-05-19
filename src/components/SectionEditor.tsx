
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
import { CheckCircle, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SectionEditorProps {
  title: string;
  description: string;
  placeholder: string;
  initialContent: string;
  sectionType?: "summary" | "experience" | "education" | "skills" | "courses" | "certifications";
  onContentChange?: (content: string) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  title,
  description,
  placeholder,
  initialContent,
  sectionType = "summary",
  onContentChange,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onContentChange) {
      onContentChange(newContent);
    }
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
      const { data, error } = await supabase.functions.invoke('polish-resume', {
        body: { content, sectionType },
      });

      if (error) {
        throw new Error(error.message);
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
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("No polished content received");
      }
    } catch (error) {
      console.error('Error polishing content:', error);
      toast({
        title: "AI Polish Failed",
        description: error.message || "There was an error polishing your content. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsPolishing(false);
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
        <Textarea
          placeholder={placeholder}
          className="min-h-[150px]"
          value={content}
          onChange={handleContentChange}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
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
