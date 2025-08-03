
import React from "react";
import ATSScanner from "@/components/ATSScanner";

interface ATSScannerToggleProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

const ATSScannerToggle: React.FC<ATSScannerToggleProps> = ({ resumeData }) => {
  return <ATSScanner resumeData={resumeData} />;
};

export default ATSScannerToggle;
