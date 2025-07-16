
import React from "react";
import ResumeEditor from "@/components/ResumeEditor";
import TailoredResumeSection from "@/components/TailoredResumeSection";
import FreeATSScanner from "@/components/FreeATSScanner";
import NewATSAnalysis from "@/components/NewATSAnalysis";
import FixMyResumeNow from "@/components/FixMyResumeNow";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import { useFixMyResume } from "@/hooks/useFixMyResume";

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

interface MainContentProps {
  currentSection: string;
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
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  summary: string;
  onSummaryChange: (summary: string) => void;
  tailoredResumeData: any;
  onClearTailoredResume: () => void;
  onTailoredResumeGenerated: (tailoredData: any) => void;
  onSectionChange: (section: string) => void;
  currentUserId: string;
  isPremiumUser: boolean;
  currentSubscription: any;
  isSaving: boolean;
  isExporting: boolean;
  sessionId: string;
  onSave: () => void;
  onExport: () => void;
  onExportWord: () => void;
  canExport: boolean;
  getCurrentResumeData: any;
}

const MainContent: React.FC<MainContentProps> = ({
  currentSection,
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
  projects,
  onProjectsChange,
  summary,
  onSummaryChange,
  tailoredResumeData,
  onClearTailoredResume,
  onTailoredResumeGenerated,
  onSectionChange,
  currentUserId,
  isPremiumUser,
  currentSubscription,
  isSaving,
  isExporting,
  sessionId,
  onSave,
  onExport,
  onExportWord,
  canExport,
  getCurrentResumeData,
}) => {
  const { handleApplyOptimizations } = useFixMyResume(currentUserId);

  const handleOptimizationsApply = async (optimizations: any) => {
    const success = await handleApplyOptimizations(
      optimizations,
      (optimizedData) => {
        // Apply optimized data to the resume state
        if (optimizedData.personalInfo) onPersonalInfoChange(optimizedData.personalInfo);
        if (optimizedData.workExperience) onWorkExperienceChange(optimizedData.workExperience);
        if (optimizedData.education) onEducationChange(optimizedData.education);
        if (optimizedData.skills) onSkillsChange(optimizedData.skills);
        if (optimizedData.coursesAndCertifications) onCoursesChange(optimizedData.coursesAndCertifications);
        if (optimizedData.projects) onProjectsChange(optimizedData.projects);
        if (optimizedData.summary) onSummaryChange(optimizedData.summary);
      },
      () => getCurrentResumeData
    );

    if (success) {
      // Auto-save after optimization
      setTimeout(() => {
        onSave();
      }, 1000);
    }
  };

  switch (currentSection) {
    case "editor":
      return (
        <ResumeEditor
          personalInfo={personalInfo}
          onPersonalInfoChange={onPersonalInfoChange}
          workExperience={workExperience}
          onWorkExperienceChange={onWorkExperienceChange}
          education={education}
          onEducationChange={onEducationChange}
          skills={skills}
          onSkillsChange={onSkillsChange}
          coursesAndCertifications={coursesAndCertifications}
          onCoursesChange={onCoursesChange}
          projects={projects}
          onProjectsChange={onProjectsChange}
          summary={summary}
          onSummaryChange={onSummaryChange}
          tailoredResumeData={tailoredResumeData}
          onClearTailoredResume={onClearTailoredResume}
          currentUserId={currentUserId}
          isPremiumUser={isPremiumUser}
          currentSubscription={currentSubscription}
          isSaving={isSaving}
          isExporting={isExporting}
          sessionId={sessionId}
          onSave={onSave}
          onExport={onExport}
          onExportWord={onExportWord}
          canExport={() => canExport}
          getCurrentResumeData={getCurrentResumeData}
        />
      );
    case "tailored-resume":
      return (
        <TailoredResumeSection
          resumeData={getCurrentResumeData}
          currentUserId={currentUserId}
          isPremiumUser={isPremiumUser}
          currentSubscription={currentSubscription}
          onTailoredResumeGenerated={onTailoredResumeGenerated}
        />
      );
    case "ats-scanner":
      return <FreeATSScanner />;
    case "ats-analysis":
      return <NewATSAnalysis resumeData={getCurrentResumeData} />;
    case "fix-resume":
      return (
        <FixMyResumeNow
          resumeData={getCurrentResumeData}
          currentUserId={currentUserId}
          isPremiumUser={isPremiumUser}
          currentSubscription={currentSubscription}
          onApplyOptimizations={handleOptimizationsApply}
          onExport={onExport}
          canExport={canExport}
        />
      );
    default:
      return null;
  }
};

export default MainContent;
