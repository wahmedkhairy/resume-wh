
import React from "react";
import NewATSPerformanceTracker from "./NewATSPerformanceTracker";

interface ATSPerformanceTrackerProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

const ATSPerformanceTracker: React.FC<ATSPerformanceTrackerProps> = ({ resumeData }) => {
  return <NewATSPerformanceTracker resumeData={resumeData} />;
};

export default ATSPerformanceTracker;
