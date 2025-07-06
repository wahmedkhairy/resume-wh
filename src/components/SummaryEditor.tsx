
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, User, Wand2 } from "lucide-react";
import KeywordEnhancer from "@/components/KeywordEnhancer";

interface SummaryEditorProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
  isPremiumUser?: boolean;
  currentUserId?: string;
  sessionId?: string;
}

const SummaryEditor: React.FC<SummaryEditorProps> = ({
  summary,
  onSummaryChange,
  isPremiumUser = false,
  currentUserId = "",
  sessionId = "",
}) => {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
        <CardDescription>
          Create a compelling professional summary that highlights your key strengths
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Manual Edit
            </TabsTrigger>
            <TabsTrigger value="enhance" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Enhance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4">
            <Textarea
              placeholder="Write a compelling professional summary that highlights your experience, skills, and career objectives. Example: 'Results-driven software engineer with 5+ years of experience in developing scalable web applications...'"
              value={summary}
              onChange={(e) => onSummaryChange(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="text-sm text-muted-foreground">
              Tip: Include your years of experience, key skills, and what you're looking for in your next role.
            </div>
          </TabsContent>
          
          <TabsContent value="enhance" className="space-y-4">
            <KeywordEnhancer
              originalText={summary}
              onEnhancedText={onSummaryChange}
              placeholder="Enter your professional summary to enhance with keywords..."
              title="Professional Summary Enhancement"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SummaryEditor;
