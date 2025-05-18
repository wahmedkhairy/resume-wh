
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

const KeywordMatcher = () => {
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();
  
  const mockKeywords = [
    { text: "React", matched: true },
    { text: "TypeScript", matched: true },
    { text: "Frontend Development", matched: true },
    { text: "Unit Testing", matched: false },
    { text: "Agile", matched: true },
    { text: "CI/CD", matched: false },
    { text: "Redux", matched: true },
    { text: "Next.js", matched: true },
    { text: "REST API", matched: false }
  ];

  const handleExtractKeywords = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Empty Description",
        description: "Please paste a job description first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Keywords Extracted",
      description: "Found 9 keywords, 6 already in your resume.",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Job Description Analysis</CardTitle>
        <CardDescription>
          Paste a job description to extract keywords and optimize your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste job description here..."
          className="min-h-[120px]"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        
        {mockKeywords.length > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {mockKeywords.map((keyword, index) => (
                <Badge 
                  key={index}
                  variant={keyword.matched ? "default" : "outline"}
                  className={keyword.matched ? "bg-resume-success/20 text-resume-success border-resume-success/30" : ""}
                >
                  {keyword.text}
                  {keyword.matched && <CheckIcon className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleExtractKeywords}>
          <Search className="mr-2 h-4 w-4" />
          Extract Keywords
        </Button>
      </CardFooter>
    </Card>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default KeywordMatcher;
