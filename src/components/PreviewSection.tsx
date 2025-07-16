
import React from "react";
import ClassicResumePreview from "@/components/ClassicResumePreview";
import ATSScanner from "@/components/ATSScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface PreviewSectionProps {
  personalInfo: any;
  summary: string;
  workExperience: any[];
  education: any[];
  skills: any[];
  coursesAndCertifications: any[];
  projects: any[];
  onSummaryChange: (summary: string) => void;
  isPremiumUser: boolean;
  currentUserId: string;
  sessionId: string;
  onQuickFix?: () => void;
  canUseFix?: boolean;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
  projects,
  onSummaryChange,
  isPremiumUser,
  currentUserId,
  sessionId,
  onQuickFix,
  canUseFix = false
}) => {
  const resumeData = {
    personalInfo,
    summary,
    workExperience,
    education,
    skills,
    coursesAndCertifications,
    projects
  };

  return (
    <div className="space-y-6">
      {/* ATS Scanner Card */}
      <ATSScanner 
        resumeData={resumeData}
        isPremiumUser={isPremiumUser}
        canUseFix={canUseFix}
        onQuickFix={onQuickFix}
      />
      
      {/* Resume Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resume Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <ClassicResumePreview
              watermark={!isPremiumUser}
              personalInfo={personalInfo}
              summary={summary}
              workExperience={workExperience}
              education={education}
              coursesAndCertifications={coursesAndCertifications}
              projects={projects}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreviewSection;
