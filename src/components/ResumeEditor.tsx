import React from "react";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import ExportControls from "@/components/ExportControls";
import SubscriptionStatusCard from "@/components/subscription/SubscriptionStatusCard";
import TailoredResumeNotice from "@/components/TailoredResumeNotice";
import { PersonalInfo } from "@/components/PersonalInfoBar";

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
  return (
    <div className="space-y-6">
      {/* SEO-optimized intro section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-3 text-gray-900">
            Build Your Professional Resume with AI-Powered Resume Builder
          </h2>
          <p className="text-gray-700 mb-4">
            Create an <strong>ATS-optimized resume</strong> that passes applicant tracking systems used by top employers. 
            Our <strong>AI resume generator</strong> helps you build job-winning CVs with professional templates designed for 2025.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">✓ ATS-Friendly Templates</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">✓ Export to PDF & Word</span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">✓ AI-Powered Optimization</span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">✓ Free Resume Builder</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Editor */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Resume Builder Tools - Create Your Professional CV
            </h3>
            
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
              Live Resume Preview - ATS-Optimized Format
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Preview your professional resume in real-time. This ATS-friendly template ensures compatibility with applicant tracking systems.
            </p>
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
