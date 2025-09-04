import React from "react";
import FreeATSScanner from "@/components/FreeATSScanner";

const FreeATSScannerSection: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">🆓 Free ATS Scanner</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your resume and get instant feedback on its ATS compatibility. 
          Our scanner analyzes format, keywords, and structure to help you improve your chances of getting through applicant tracking systems.
        </p>
      </div>

      <div className="flex justify-center">
        <FreeATSScanner />
      </div>
    </div>
  );
};

export default FreeATSScannerSection;