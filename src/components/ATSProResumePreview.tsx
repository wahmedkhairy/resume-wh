
import React from "react";
import ATSProResumeTemplate from "@/components/ATSProResumeTemplate";

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

interface ATSProResumePreviewProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  projects: Project[];
}

const ATSProResumePreview: React.FC<ATSProResumePreviewProps> = (props) => {
  return <ATSProResumeTemplate {...props} />;
};

export default ATSProResumePreview;
