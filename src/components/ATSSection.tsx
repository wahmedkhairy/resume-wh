
import React from "react";
import NewATSAnalysis from "@/components/NewATSAnalysis";
import FreeATSScanner from "@/components/FreeATSScanner";
import CallToAction from "@/components/CallToAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">ATS Analysis & Free Scan</h2>
        <p className="text-lg text-muted-foreground">
          Optimize your resume for Applicant Tracking Systems with our free scanner or detailed analysis.
        </p>
      </div>

      <Tabs defaultValue="free-scan" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="free-scan">Free ATS Scan</TabsTrigger>
          <TabsTrigger value="detailed-analysis">Detailed Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="free-scan" className="space-y-6">
          <FreeATSScanner />
        </TabsContent>
        
        <TabsContent value="detailed-analysis" className="space-y-6">
          <NewATSAnalysis resumeData={resumeData} />
        </TabsContent>
      </Tabs>
      
      <CallToAction 
        variant="export" 
        urgency={true}
        className="mt-8"
      />
    </div>
  );
};

export default ATSSection;
