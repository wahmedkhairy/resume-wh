
import React from "react";
import PersonalInfoBar, { PersonalInfo } from "@/components/PersonalInfoBar";
import WorkExperienceBar from "@/components/WorkExperienceBar";
import EducationBar from "@/components/EducationBar";
import SkillsBar from "@/components/SkillsBar";
import CoursesAndCertifications from "@/components/CoursesAndCertifications";
import SummaryEditor from "@/components/SummaryEditor";
import KeywordMatcher from "@/components/KeywordMatcher";

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
  writingStyle?: "bullets" | "paragraph";
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
  experienceType?: "fulltime" | "remote" | "internship";
  writingStyle?: "bullets" | "paragraph";
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  location: string;
}

interface ResumeDataProps {
  personalInfo: PersonalInfo;
  onPersonalInfoChange: (info: PersonalInfo) => void;
  workExperience: WorkExperience[];
  onWorkExperienceChange: (experience: WorkExperience[]) => void;
  education: Education[];
  onEducationChange: (education: Education[]) => void;
  skills: Skill[];
  onSkillsChange: (skills: Skill[]) => void;
  coursesAndCertifications: Course[];
  onCoursesChange: (courses: Course[]) => void;
  summary: string;
  onSummaryChange: (summary: string) => void;
}

const ResumeData: React.FC<ResumeDataProps> = ({
  personalInfo,
  onPersonalInfoChange,
  workExperience,
  onWorkExperienceChange,
  education,
  onEducationChange,
  skills,
  onSkillsChange,
  coursesAndCertifications,
  onCoursesChange,
  summary,
  onSummaryChange,
}) => {
  return (
    <div className="space-y-6">
      <PersonalInfoBar 
        onInfoChange={onPersonalInfoChange}
        initialInfo={personalInfo}
      />
      
      <WorkExperienceBar 
        onExperienceChange={onWorkExperienceChange}
        initialExperience={workExperience}
      />
      
      <EducationBar 
        onEducationChange={onEducationChange}
        initialEducation={education}
      />
      
      <CoursesAndCertifications 
        onCoursesChange={onCoursesChange}
        initialCourses={coursesAndCertifications}
      />
      
      <SkillsBar 
        onSkillsChange={onSkillsChange}
        initialSkills={skills}
      />

      <SummaryEditor
        initialSummary={summary}
        onSummaryChange={onSummaryChange}
        workExperience={workExperience}
        education={education}
        skills={skills}
        personalInfo={personalInfo}
      />
      
      <KeywordMatcher />
    </div>
  );
};

export default ResumeData;
