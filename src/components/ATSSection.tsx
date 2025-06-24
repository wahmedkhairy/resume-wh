
import React from "react";
import NewATSAnalysis from "@/components/NewATSAnalysis";
import FreeATSScanner from "@/components/FreeATSScanner";
import CallToAction from "@/components/CallToAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ATSSectionProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

const ATSSection: React.FC<ATSSectionProps> = ({ resumeData }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">ATS Tools & Analysis</h2>
        <p className="text-lg text-muted-foreground">
          Choose between our free scanner or detailed analysis to optimize your resume for ATS systems.
        </p>
      </div>

      {/* Free ATS Scanner - Independent Section */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl">🆓 Free ATS Scanner</CardTitle>
          <CardDescription className="text-lg">
            Get instant feedback on your resume's ATS compatibility - completely free, no strings attached.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-w-3xl mx-auto">
            <FreeATSScanner />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Separator className="flex-1" />
        <span className="px-4 text-muted-foreground font-medium">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* Detailed Analysis - Separate Section */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-2xl">🎯 Detailed ATS Analysis</CardTitle>
          <CardDescription className="text-lg">
            Advanced analysis with job-specific optimization and personalized recommendations based on your current resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full">
            <NewATSAnalysis resumeData={resumeData} />
          </div>
        </CardContent>
      </Card>
      
      <CallToAction 
        variant="export" 
        urgency={true}
        className="mt-8"
      />
    </div>
  );
};

export default ATSSection;
