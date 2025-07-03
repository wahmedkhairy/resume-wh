import React from "react";
import ResumeEditor from "./ResumeEditor";
import TailoredResumeSection from "./TailoredResumeSection";
import SubscriptionTiers from "./SubscriptionTiers";
import UserSettings from "./UserSettings";
import { PersonalInfo } from "./PersonalInfoBar";

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
  summary: string;
  onSummaryChange: (summary: string) => void;
  tailoredResumeData: any;
  onClearTailoredResume: () => void;
  onTailoredResumeGenerated: (tailoredData: any) => void;
  onSectionChange: (section: string) => void;
  currentUserId: string;
  isPremiumUser: boolean;
  currentSubscription: any;
  canAccessTargetedResumes: boolean;
  isSaving: boolean;
  isExporting: boolean;
  sessionId: string;
  onSave: () => void;
  onExport: () => void;
  onExportWord: () => void;
  canExport: () => boolean;
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
  summary,
  onSummaryChange,
  tailoredResumeData,
  onClearTailoredResume,
  onTailoredResumeGenerated,
  onSectionChange,
  currentUserId,
  isPremiumUser,
  currentSubscription,
  canAccessTargetedResumes,
  isSaving,
  isExporting,
  sessionId,
  onSave,
  onExport,
  onExportWord,
  canExport,
  getCurrentResumeData,
}) => {
  // NEW: Export functions for targeted resumes
  const handleExportTailoredResume = async (tailoredData: any) => {
    console.log('Exporting tailored resume as PDF:', tailoredData);
    await onExport(); // Use the same export function but with tailored data
  };

  const handleExportTailoredResumeAsWord = async (tailoredData: any) => {
    console.log('Exporting tailored resume as Word:', tailoredData);
    await onExportWord(); // Use the same export function but with tailored data
  };

  console.log('MainContent currentSection:', currentSection);

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
          canExport={canExport}
          getCurrentResumeData={getCurrentResumeData}
        />
      );

    case "targeted-resumes":
      return (
        <TailoredResumeSection
          resumeData={getCurrentResumeData}
          currentUserId={currentUserId}
          isPremiumUser={isPremiumUser}
          currentSubscription={currentSubscription}
          canAccessTargetedResumes={canAccessTargetedResumes}
          onTailoredResumeGenerated={onTailoredResumeGenerated}
          onExportTailoredResume={handleExportTailoredResume}
          onExportTailoredResumeAsWord={handleExportTailoredResumeAsWord}
          isExporting={isExporting}
        />
      );

    case "subscription":
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-muted-foreground">Select the perfect plan for your career goals</p>
          </div>
          <SubscriptionTiers
            currentUserId={currentUserId}
            currentSubscription={currentSubscription}
            onSubscriptionUpdate={() => window.location.reload()}
          />
        </div>
      );

    case "settings":
      return (
        <UserSettings />
      );

    case "success-stories":
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Success Stories</h2>
            <p className="text-muted-foreground">See how our users achieved their career goals</p>
          </div>
          <div className="text-center text-muted-foreground">
            Success stories coming soon...
          </div>
        </div>
      );

    default:
      console.error('Unknown section:', currentSection);
      return <div>Section not found: {currentSection}</div>;
  }
};

export default MainContent;
