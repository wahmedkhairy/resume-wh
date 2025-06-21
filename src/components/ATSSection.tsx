
import React from "react";
import NewATSAnalysis from "@/components/NewATSAnalysis";
import CallToAction from "@/components/CallToAction";

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
      <NewATSAnalysis resumeData={resumeData} />
      
      <CallToAction 
        variant="export" 
        urgency={true}
        className="mt-8"
      />
    </div>
  );
};

export default ATSSection;
