
import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import UserSuccessStories from "@/components/UserSuccessStories";
import ResumeEditor from "@/components/ResumeEditor";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import AuthSection from "@/components/sections/AuthSection";
import SubscriptionSection from "@/components/sections/SubscriptionSection";
import FreeATSScannerSection from "@/components/sections/FreeATSScannerSection";
import PrivacyPolicySection from "@/components/sections/PrivacyPolicySection";
import TermsOfServiceSection from "@/components/sections/TermsOfServiceSection";
import ForgotPasswordSection from "@/components/sections/ForgotPasswordSection";

const SettingsSection = React.lazy(() => import("@/components/SettingsSection"));
const ATSSection = React.lazy(() => import("@/components/ATSSection"));
const TailoredResumeSection = React.lazy(() => import("@/components/TailoredResumeSection"));

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  </div>
);

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
  onTailoredResumeGenerated: (data: any) => void;
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
  switch (currentSection) {
    case "settings":
      return (
        <Suspense fallback={<LoadingSkeleton />}>
          <SettingsSection />
        </Suspense>
      );
    
    case "success-stories":
      return <UserSuccessStories />;
    
    case "ats":
      return (
        <Suspense fallback={<LoadingSkeleton />}>
          <ATSSection resumeData={getCurrentResumeData} />
        </Suspense>
      );
    
    case "tailor":
      const originalResumeData = {
        personalInfo,
        summary,
        workExperience,
        education,
        skills,
        coursesAndCertifications,
        projects,
      };
      return (
        <Suspense fallback={<LoadingSkeleton />}>
          <TailoredResumeSection
            resumeData={originalResumeData}
            currentUserId={currentUserId}
            isPremiumUser={isPremiumUser}
            currentSubscription={currentSubscription}
            onTailoredResumeGenerated={onTailoredResumeGenerated}
          />
        </Suspense>
      );


    case "privacy-policy":
      return <PrivacyPolicySection />;

    case "terms-of-service":
      return <TermsOfServiceSection />;

    case "forgot-password":
      return (
        <ForgotPasswordSection
          onSectionChange={onSectionChange}
        />
      );
    
    default:
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
          canExport={canExport}
          getCurrentResumeData={getCurrentResumeData}
        />
      );
  }
};

export default MainContent;
