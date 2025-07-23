import React, { useEffect, useState } from "react";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import ExportControls from "@/components/ExportControls";
import SubscriptionStatusCard from "@/components/subscription/SubscriptionStatusCard";
import TailoredResumeNotice from "@/components/TailoredResumeNotice";
import ResumeTipsPanel from "@/components/ResumeTipsPanel";
import ATSScannerToggle from "@/components/ATSScannerToggle";
import { PersonalInfo } from "@/components/PersonalInfoBar";
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
  getCurrentResumeData?: any;
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
  const [showTips, setShowTips] = useState(false);
  const [improvementTips, setImprovementTips] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's uploaded resume data from the ATS scanner
    const uploadedData = localStorage.getItem('uploadedResumeData');
    const tips = localStorage.getItem('resumeImprovementTips');
    
    if (uploadedData && tips) {
      try {
        const parsedData = JSON.parse(uploadedData);
        const parsedTips = JSON.parse(tips);
        
        // Use React.startTransition to batch all updates
        React.startTransition(() => {
          // Load the extracted resume data all at once in a single batch
          if (parsedData.personalInfo) {
            onPersonalInfoChange(parsedData.personalInfo);
          }
          
          if (parsedData.summary) {
            onSummaryChange(parsedData.summary);
          }
          
          if (parsedData.workExperience) {
            onWorkExperienceChange(parsedData.workExperience);
          }
          
          if (parsedData.education) {
            onEducationChange(parsedData.education);
          }
          
          if (parsedData.skills) {
            onSkillsChange(parsedData.skills);
          }
          
          // Set improvement tips after data loading
          setImprovementTips(parsedTips);
          setShowTips(true);
          
          // Clear the localStorage after loading
          localStorage.removeItem('uploadedResumeData');
          localStorage.removeItem('resumeImprovementTips');
          // Keep atsAnalysisCompleted flag to signal ATS scanner
          
          toast({
            title: "Resume Data Loaded",
            description: "Your resume has been imported from the ATS scanner. Review the improvement tips below.",
          });
        });
        
      } catch (error) {
        console.error('Error parsing uploaded resume data:', error);
        toast({
          title: "Import Error",
          description: "There was an error loading your resume data.",
          variant: "destructive",
        });
      }
    }
  }, [onPersonalInfoChange, onSummaryChange, onWorkExperienceChange, onEducationChange, onSkillsChange, toast]);

  const handleDismissTips = () => {
    setShowTips(false);
    setImprovementTips([]);
  };

  // Get the current resume data (either tailored or original) - properly memoized
  const currentResumeData = React.useMemo(() => {
    // If we have a function to get current resume data, use it
    if (typeof getCurrentResumeData === 'function') {
      return getCurrentResumeData();
    }
    
    // Otherwise, check if we have tailored resume data
    if (tailoredResumeData) {
      return tailoredResumeData;
    }
    
    // Fallback to the current state data
    return {
      personalInfo,
      summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications,
      projects,
    };
  }, [getCurrentResumeData, tailoredResumeData, personalInfo, summary, workExperience, education, skills, coursesAndCertifications, projects]);

  // Memoize the data for ATS scanner to prevent unnecessary re-renders
  const atsResumeData = React.useMemo(() => ({
    personalInfo: currentResumeData.personalInfo,
    summary: currentResumeData.summary,
    workExperience: currentResumeData.workExperience,
    education: currentResumeData.education,
    skills: currentResumeData.skills,
    coursesAndCertifications: currentResumeData.coursesAndCertifications,
  }), [currentResumeData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Editor */}
      <div className="lg:col-span-6 space-y-6">
        {showTips && improvementTips.length > 0 && (
          <ResumeTipsPanel 
            tips={improvementTips} 
            onDismiss={handleDismissTips}
          />
        )}

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
      <div className="lg:col-span-6 space-y-6">
        <PreviewSection
          personalInfo={currentResumeData.personalInfo}
          summary={currentResumeData.summary}
          workExperience={currentResumeData.workExperience}
          education={currentResumeData.education}
          skills={currentResumeData.skills}
          coursesAndCertifications={currentResumeData.coursesAndCertifications}
          projects={currentResumeData.projects}
          onSummaryChange={onSummaryChange}
          isPremiumUser={isPremiumUser}
          currentUserId={currentUserId}
          sessionId={sessionId}
        />
        
        <ATSScannerToggle
          resumeData={atsResumeData}
        />
      </div>
    </div>
  );
};

export default ResumeEditor;
