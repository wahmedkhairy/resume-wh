
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle } from "lucide-react";

const ATSScanner = () => {
  const systems = [
    { name: "Workday", score: 97 },
    { name: "Taleo", score: 94 },
    { name: "Lever", score: 98 },
    { name: "Greenhouse", score: 95 },
  ];

  const issues = [
    "Consider adding more quantifiable achievements",
    "Ensure all job titles are standardized",
    "Add LinkedIn profile URL for better online presence"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="mr-2 h-5 w-5 text-resume-success" /> 
          ATS Compatibility
        </CardTitle>
        <CardDescription>
          How your resume performs across different ATS platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systems.map((system) => (
            <div key={system.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{system.name}</span>
                <span className="font-medium">{system.score}%</span>
              </div>
              <Progress value={system.score} />
            </div>
          ))}
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center mb-2">
              <AlertCircle className="mr-2 h-5 w-5 text-resume-warning" />
              <h4 className="font-medium">Suggestions for improvement</h4>
            </div>
            <ul className="text-sm space-y-2 pl-7 list-disc">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSScanner;
