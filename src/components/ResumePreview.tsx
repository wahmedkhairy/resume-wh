import React from "react";
import ATSProResumePreview from "@/components/ATSProResumePreview";

interface PersonalInfo {
  name: string;
  jobTitle: string;
  location: string;
  email: string;
  phone: string;
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

interface ResumePreviewProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  onSummaryChange?: (summary: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
}) => {
  // Use the new ATS-Pro template
  // Note: Skills are intentionally not passed to the preview as they're for AI input only
  return (
    <ATSProResumePreview
      watermark={watermark}
      personalInfo={personalInfo}
      summary={summary}
      workExperience={workExperience}
      education={education}
      coursesAndCertifications={coursesAndCertifications}
    />
  );
};

export default ResumePreview;
