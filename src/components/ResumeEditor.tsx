
import React from "react";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import ExportControls from "@/components/ExportControls";
import TailoredResumeNotice from "@/components/TailoredResumeNotice";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import { supabase } from "@/integrations/supabase/client";
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
  const remainingExports = currentSubscription?.scan_count || 0;
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const resumeData = {
        personal_info: personalInfo,
        summary: summary,
        experience: workExperience,
        education: education,
        skills: skills,
        courses: coursesAndCertifications
      };

      const { error } = await supabase
        .from('resumes')
        .upsert({
          user_id: currentUserId,
          title: personalInfo.name ? `${personalInfo.name}'s Resume` : 'My Resume',
          ...resumeData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Editor */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {tailoredResumeData && (
              <TailoredResumeNotice onSwitchToOriginal={onClearTailoredResume} />
            )}

            <ExportControls
              onSave={handleSave}
              isSaving={isSaving}
              isTailoredResume={!!tailoredResumeData}
              onExport={onExport}
              onExportWord={onExportWord}
              isExporting={isExporting}
              canExport={canExport()}
              remainingExports={remainingExports}
              isPremiumUser={isPremiumUser}
            />
          </div>
          
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
            summary={summary}
            onSummaryChange={onSummaryChange}
          />
        </div>
        
        {/* Right Column - Preview */}
        <div className="lg:col-span-6">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Resume Preview
            </h3>
          </div>
          
          <PreviewSection
            personalInfo={getCurrentResumeData.personalInfo}
            summary={getCurrentResumeData.summary}
            workExperience={getCurrentResumeData.workExperience}
            education={getCurrentResumeData.education}
            skills={getCurrentResumeData.skills}
            coursesAndCertifications={getCurrentResumeData.coursesAndCertifications}
            onSummaryChange={onSummaryChange}
            isPremiumUser={isPremiumUser}
            currentUserId={currentUserId}
            sessionId={sessionId}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
