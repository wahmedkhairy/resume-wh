
import React from "react";
import ATSScanner from "@/components/ATSScanner";
import ATSPerformanceTracker from "@/components/ATSPerformanceTracker";

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">ATS Analysis</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">ATS Compatibility Score</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                  <p className="text-sm text-muted-foreground">Your resume is ATS-friendly</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Keyword Optimization</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">72%</div>
                  <p className="text-sm text-muted-foreground">Consider adding more relevant keywords</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ATSScanner resumeData={resumeData} />
              <ATSPerformanceTracker resumeData={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSSection;
