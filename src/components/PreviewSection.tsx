
import React from "react";
import ResumePreview from "@/components/ResumePreview";
import ATSScanner from "@/components/ATSScanner";
import AntiTheftProtection from "@/components/AntiTheftProtection";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  location: string;
}

interface PreviewSectionProps {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  onSummaryChange: (summary: string) => void;
  isPremiumUser: boolean;
  currentUserId: string;
  sessionId: string;
  onExport?: () => void;
  onExportWord?: () => void;
  isExporting?: boolean;
  canExport?: boolean;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
  onSummaryChange,
  isPremiumUser,
  currentUserId,
  sessionId,
  onExport,
  onExportWord,
  isExporting = false,
  canExport = false,
}) => {
  // Prepare resume data for ATS Scanner
  const resumeData = {
    personalInfo,
    summary,
    workExperience,
    education,
    skills,
    coursesAndCertifications,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Resume Preview</h2>
          
          {/* Export Controls in Preview Section */}
          {canExport && onExport && onExportWord && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export Resume"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportWord}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as Word (.DOCX)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="border rounded-lg bg-white relative">
          <ResumePreview 
            watermark={!isPremiumUser}
            personalInfo={personalInfo}
            summary={summary}
            workExperience={workExperience}
            education={education}
            skills={skills}
            coursesAndCertifications={coursesAndCertifications}
            onSummaryChange={onSummaryChange}
          />
          <AntiTheftProtection 
            isActive={!isPremiumUser}
            userId={currentUserId}
            sessionId={sessionId}
          />
        </div>
      </div>
      
      <ATSScanner resumeData={resumeData} />
    </div>
  );
};

export default PreviewSection;
