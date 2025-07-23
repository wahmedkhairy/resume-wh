
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0 bg-white/80 hover:bg-white/90 shadow-sm"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isExpanded && <ATSScanner resumeData={resumeData} />}
    </div>
  );
};

export default ATSScannerToggle;
