
import React, { useState } from "react";
import ClassicResumePreview from "@/components/ClassicResumePreview";
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
  onSummaryChange: (summary: string) => void;
}

const getSummaryDisplayText = (summary: string) => {
  if (!summary || summary.trim().length === 0) {
    return `💡 Professional Summary Writing Tips:

• Start with your job title and highlight 2-3 key achievements with specific numbers
• Mention your most relevant skills for the target role and keep it to 3-4 sentences maximum`;
  }
  return summary;
};

const ResumePreview: React.FC<ResumePreviewProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
  onSummaryChange,
}) => {
  const [selectedTemplate] = useState("classic");

  const displaySummary = getSummaryDisplayText(summary);

  const commonProps = {
    watermark,
    personalInfo,
    summary: displaySummary,
    workExperience,
    education,
    skills,
    coursesAndCertifications,
  };

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      {selectedTemplate === "classic" ? (
        <ClassicResumePreview {...commonProps} />
      ) : (
        <ATSProResumePreview {...commonProps} />
      )}
    </div>
  );
};

export default ResumePreview;
