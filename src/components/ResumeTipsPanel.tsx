
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle, X } from "lucide-react";

interface ResumeTipsPanelProps {
  tips: string[];
  onDismiss: () => void;
}

const ResumeTipsPanel: React.FC<ResumeTipsPanelProps> = ({ tips, onDismiss }) => {
  if (!tips || tips.length === 0) return null;

  return (
    <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-800">Resume Improvement Tips</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-orange-600 hover:text-orange-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-orange-700">
          Based on your ATS scan results, here are specific improvements to make your resume stronger:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100">
              <CheckCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{tip}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-orange-100 rounded-lg">
          <p className="text-xs text-orange-800">
            💡 <strong>Pro tip:</strong> Focus on these improvements as you edit your resume sections below. 
            Each change will help increase your ATS compatibility score.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeTipsPanel;
