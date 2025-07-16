
import React from "react";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import ExportControls from "@/components/ExportControls";
import SubscriptionStatusCard from "@/components/subscription/SubscriptionStatusCard";
import TailoredResumeNotice from "@/components/TailoredResumeNotice";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import { useFixMyResume } from "@/hooks/useFixMyResume";
import { useToast } from "@/hooks/use-toast";

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

interface ResumeEditorProps {
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

const ResumeEditor: React.FC<ResumeEditorProps> = ({
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
  const { handleApplyOptimizations, isApplyingFix } = useFixMyResume(currentUserId);
  const { toast } = useToast();

  // Check if user can use fix feature
  const canUseFix = () => {
    if (!currentSubscription) return false;
    
    switch (currentSubscription.tier) {
      case 'unlimited':
        return true;
      case 'premium':
        return true; // Will check usage in the component
      case 'basic':
        return true; // Will check usage in the component
      default:
        return false;
    }
  };

  const handleQuickFix = async () => {
    // Generate quick optimizations based on current resume
    const quickOptimizations = [
      {
        id: 'quick-keywords',
        type: 'critical' as const,
        category: 'keywords' as const,
        title: 'Add Industry Keywords',
        description: 'Enhance with relevant keywords',
        impact: 15,
        selected: true
      },
      {
        id: 'quick-content',
        type: 'important' as const,
        category: 'content' as const,
        title: 'Improve Content',
        description: 'Enhance job descriptions',
        impact: 12,
        selected: true
      }
    ];

    const success = await handleApplyOptimizations(
      quickOptimizations,
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
      toast({
        title: "Quick Fix Applied!",
        description: "Your resume has been optimized. Check the preview to see improvements.",
      });
      
      // Auto-save after quick fix
      setTimeout(() => {
        onSave();
      }, 1000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Editor */}
      <div className="lg:col-span-6 space-y-6">
        {tailoredResumeData && (
          <TailoredResumeNotice onSwitchToOriginal={onClearTailoredResume} />
        )}

        <ExportControls
          onSave={onSave}
          isSaving={isSaving}
          isTailoredResume={!!tailoredResumeData}
          onExport={onExport}
          onExportWord={onExportWord}
          isExporting={isExporting}
          canExport={canExport()}
        />

        <SubscriptionStatusCard subscription={currentSubscription} />
        
        <ResumeData
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
        />
      </div>
      
      {/* Right Column - Preview */}
      <div className="lg:col-span-6">
        <PreviewSection
          personalInfo={getCurrentResumeData.personalInfo}
          summary={getCurrentResumeData.summary}
          workExperience={getCurrentResumeData.workExperience}
          education={getCurrentResumeData.education}
          skills={getCurrentResumeData.skills}
          coursesAndCertifications={getCurrentResumeData.coursesAndCertifications}
          projects={getCurrentResumeData.projects}
          onSummaryChange={onSummaryChange}
          isPremiumUser={isPremiumUser}
          currentUserId={currentUserId}
          sessionId={sessionId}
          onQuickFix={handleQuickFix}
          canUseFix={canUseFix()}
        />
      </div>
    </div>
  );
};

export default ResumeEditor;
