
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

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

  const handleSummaryChange = (value: string) => {
    setSummary(value);
    onSummaryChange(value);
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
          variant="default"
          disabled={true}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Clock className="mr-2 h-4 w-4" />
          Generate with AI - Coming Soon
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <p>Tip: A good summary should be 2-3 sentences that highlight your most relevant experience and skills for your target role.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryEditor;
