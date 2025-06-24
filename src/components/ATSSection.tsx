
import React from "react";
import NewATSAnalysis from "@/components/NewATSAnalysis";
import CallToAction from "@/components/CallToAction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <h2 className="text-3xl font-bold mb-4">Professional ATS Analysis</h2>
        <p className="text-lg text-muted-foreground">
          Get detailed analysis with job-specific optimization and personalized recommendations based on your current resume.
        </p>
      </div>

      {/* Detailed Analysis - Main Feature */}
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-2xl">🎯 Advanced ATS Analysis</CardTitle>
          <CardDescription className="text-lg">
            Comprehensive analysis with job-specific optimization, keyword matching, and personalized improvement recommendations.
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
