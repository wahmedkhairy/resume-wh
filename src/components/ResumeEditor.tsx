
import React from "react";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import ExportControls from "@/components/ExportControls";
import TailoredResumeNotice from "@/components/TailoredResumeNotice";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";

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
  const getExportInfo = () => {
    if (!currentSubscription) {
      return {
        remaining: 0,
        isUnlimited: false
      };
    }

    const isUnlimited = currentSubscription.tier === 'unlimited';
    const remaining = isUnlimited ? 999 : (currentSubscription.scan_count || 0);
    
    return {
      remaining,
      isUnlimited
    };
  };

  const exportInfo = getExportInfo();

  return (
    <div className="space-y-6">
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

            {/* Simplified Export Status Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Export Status
                    </span>
                  </div>
                  
                  <div className="flex items-center text-blue-600 font-medium">
                    {exportInfo.isUnlimited ? (
                      <span>Unlimited exports available</span>
                    ) : (
                      <span>{exportInfo.remaining} exports remaining</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
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
