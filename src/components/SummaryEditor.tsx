
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface SummaryEditorProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  onSummaryChange,
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
        <CardDescription>
          Create a compelling professional summary that highlights your key strengths
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Write a compelling professional summary that highlights your experience, skills, and career objectives. Example: 'Results-driven software engineer with 5+ years of experience in developing scalable web applications...'"
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          className="min-h-[120px]"
        />
        <div className="text-sm text-muted-foreground mt-2">
          Tip: Include your years of experience, key skills, and what you're looking for in your next role.
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryEditor;
