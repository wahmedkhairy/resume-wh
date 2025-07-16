
import React from "react";
import ResumePreview from "@/components/ResumePreview";
import ATSScanner from "@/components/ATSScanner";
import AntiTheftProtection from "@/components/AntiTheftProtection";
import { PersonalInfo } from "@/components/PersonalInfoBar";

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

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate: string;
  url?: string;
  writingStyle?: "bullet" | "paragraph";
}

interface PreviewSectionProps {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  projects: Project[];
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
  projects,
  onSummaryChange,
  isPremiumUser,
  currentUserId,
  sessionId,
}) => {
  // Prepare resume data for ATS Scanner
  const resumeData = {
    personalInfo,
    summary,
    workExperience,
    education,
    skills,
    coursesAndCertifications,
    projects,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Resume Preview</h2>
        </div>
        
        <div className="border rounded-lg bg-white relative" data-resume-preview>
          <ResumePreview 
            watermark={!isPremiumUser}
            personalInfo={personalInfo}
            summary={summary}
            workExperience={workExperience}
            education={education}
            skills={skills}
            coursesAndCertifications={coursesAndCertifications}
            projects={projects}
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
