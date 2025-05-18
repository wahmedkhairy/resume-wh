
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

interface SectionEditorProps {
  title: string;
  description: string;
  placeholder: string;
  initialContent: string;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  title,
  description,
  placeholder,
  initialContent,
}) => {
  const [content, setContent] = useState(initialContent);
  const { toast } = useToast();

  const handleAIPolish = () => {
    toast({
      title: "AI Polish",
      description: "Premium feature. Please upgrade to use AI.",
      variant: "default",
    });
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
          onChange={(e) => setContent(e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <Button variant="outline" size="sm" onClick={handleAIPolish}>
            Polish with AI
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <CheckCircle className="mr-1 h-4 w-4 text-resume-success" /> Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SectionEditor;
