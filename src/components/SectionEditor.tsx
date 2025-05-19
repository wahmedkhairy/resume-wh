
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

interface SectionEditorProps {
  title: string;
  description: string;
  placeholder: string;
  initialContent: string;
  sectionType?: "summary" | "experience" | "education" | "skills" | "courses" | "certifications";
  onContentChange?: (content: string) => void;
}

// Basic AI enhancement functions for fallback when the API is unavailable
const enhanceContent = (content: string, type: string): string => {
  if (!content.trim()) return content;
  
  let enhanced = content;
  
  // Basic enhancements based on content type
  switch(type) {
    case "summary":
      enhanced = enhanced.replace(/^I am /i, "An experienced professional ");
      enhanced = enhanced.replace(/^I have /i, "With ");
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
      if (!enhanced.endsWith('.')) enhanced += '.';
      break;
      
    case "experience":
      // Add action verbs to bullet points if they don't start with one
      const actionVerbs = ["Developed", "Created", "Implemented", "Managed", "Led", "Designed", "Optimized", "Improved"];
      const lines = enhanced.split('\n');
      enhanced = lines.map(line => {
        if (line.trim().startsWith('- ') && !actionVerbs.some(verb => line.trim().substring(2).startsWith(verb))) {
          const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
          return `- ${randomVerb} ${line.trim().substring(2)}`;
        }
        return line;
      }).join('\n');
      break;
      
    case "education":
      // Ensure proper formatting for education entries
      enhanced = enhanced.replace(/(\d{4})-(\d{4})/, "$1 - $2"); // Add spaces around date ranges
      break;
  }
  
  return enhanced;
};

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
      const { data, error } = await fetch('/api/polish-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, sectionType }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
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
      } else {
        // Fallback to basic enhancements if API doesn't return polished content
        const enhancedContent = enhanceContent(content, sectionType);
        setContent(enhancedContent);
        if (onContentChange) {
          onContentChange(enhancedContent);
        }
        toast({
          title: "Content Polished",
          description: "Your content has been enhanced using local processing.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error polishing content:', error);
      
      // Use local enhancement as fallback when API fails
      const enhancedContent = enhanceContent(content, sectionType);
      setContent(enhancedContent);
      if (onContentChange) {
        onContentChange(enhancedContent);
      }
      
      toast({
        title: "AI Service Unavailable",
        description: "Using local enhancements instead. Try again later for AI-powered improvements.",
        variant: "default",
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
