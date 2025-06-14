import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import ExportControls from "@/components/ExportControls";
import SettingsSection from "@/components/SettingsSection";
import ATSSection from "@/components/ATSSection";
import TailoredResumeSection from "@/components/TailoredResumeSection";
import { useResumeData } from "@/hooks/useResumeData";
import { useSubscription } from "@/hooks/useSubscription";
import { exportResumeAsText } from "@/utils/resumeExport";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("editor");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [sessionId] = useState(`session_${Date.now()}`);
  const [tailoredResumeData, setTailoredResumeData] = useState<any>(null);
  const { toast } = useToast();

  const {
    resumeState,
    setResumeState,
    personalInfo,
    setPersonalInfo,
    workExperience,
    setWorkExperience,
    education,
    setEducation,
    skills,
    setSkills,
    coursesAndCertifications,
    setCoursesAndCertifications,
    isSaving,
    handleSave,
  } = useResumeData(currentUserId);

  const {
    currentSubscription,
    isPremiumUser,
    isExporting,
    handleExport,
    handleWordExport,
  } = useSubscription(currentUserId);

  // Check user authentication and load data
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    checkUser();
  }, []);

  const handlePersonalInfoChange = (info: any) => {
    setPersonalInfo(info);
  };

  const handleWorkExperienceChange = (newExperience: any) => {
    setWorkExperience(newExperience);
  };

  const handleEducationChange = (newEducation: any) => {
    setEducation(newEducation);
  };

  const handleSkillsChange = (newSkills: any) => {
    setSkills(newSkills);
  };

  const handleCoursesChange = (newCourses: any) => {
    setCoursesAndCertifications(newCourses);
  };

  const handleSummaryChange = (newSummary: string) => {
    setResumeState(prev => ({
      ...prev,
      summary: newSummary
    }));
  };

  const handleExportResume = async () => {
    const exportData = tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };

    await handleExport(exportData);
  };

  const handleExportResumeAsText = () => {
    const exportData = tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };

    exportResumeAsText(exportData);
  };

  const handleExportResumeAsWord = async () => {
    const exportData = tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };

    await handleWordExport(exportData);
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Clear tailored resume data when switching sections
    if (section !== "editor") {
      setTailoredResumeData(null);
    }
  };

  const handleTailoredResumeGenerated = (tailoredData: any) => {
    setTailoredResumeData(tailoredData);
    toast({
      title: "Tailored Resume Ready",
      description: "Your tailored resume is now displayed in the preview. You can export it or make further adjustments.",
    });
  };

  // Get current resume data (either tailored or original)
  const getCurrentResumeData = () => {
    return tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };
  };

  const currentResumeData = getCurrentResumeData();

  const renderMainContent = () => {
    switch (currentSection) {
      case "settings":
        return <SettingsSection />;
      
      case "ats":
        return <ATSSection resumeData={currentResumeData} />;
      
      case "tailor":
        const originalResumeData = {
          personalInfo,
          summary: resumeState.summary,
          workExperience,
          education,
          skills,
          coursesAndCertifications,
        };
        return (
          <TailoredResumeSection
            resumeData={originalResumeData}
            currentUserId={currentUserId}
            isPremiumUser={isPremiumUser}
            currentSubscription={currentSubscription}
            onTailoredResumeGenerated={handleTailoredResumeGenerated}
          />
        );
      
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-6 space-y-6">
              {tailoredResumeData && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">Tailored Resume Active</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        You're viewing a tailored version of your resume.
                      </p>
                    </div>
                    <button
                      onClick={() => setTailoredResumeData(null)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Switch to Original
                    </button>
                  </div>
                </div>
              )}

              <ExportControls
                onSave={handleSave}
                onExport={handleExportResume}
                onExportWord={handleExportResumeAsWord}
                isSaving={isSaving}
                isExporting={isExporting}
                currentUserId={currentUserId}
                isPremiumUser={isPremiumUser}
                isTailoredResume={!!tailoredResumeData}
              />

              <SubscriptionStatus
                isPremiumUser={isPremiumUser}
                currentSubscription={currentSubscription}
              />
              
              <ResumeData
                personalInfo={personalInfo}
                onPersonalInfoChange={handlePersonalInfoChange}
                workExperience={workExperience}
                onWorkExperienceChange={handleWorkExperienceChange}
                education={education}
                onEducationChange={handleEducationChange}
                skills={skills}
                onSkillsChange={handleSkillsChange}
                coursesAndCertifications={coursesAndCertifications}
                onCoursesChange={handleCoursesChange}
                summary={resumeState.summary}
                onSummaryChange={handleSummaryChange}
              />
            </div>
            
            {/* Right Column - Preview */}
            <div className="lg:col-span-6">
              <PreviewSection
                personalInfo={currentResumeData.personalInfo}
                summary={currentResumeData.summary}
                workExperience={currentResumeData.workExperience}
                education={currentResumeData.education}
                skills={currentResumeData.skills}
                coursesAndCertifications={currentResumeData.coursesAndCertifications}
                onSummaryChange={handleSummaryChange}
                isPremiumUser={isPremiumUser}
                currentUserId={currentUserId}
                sessionId={sessionId}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation onSectionChange={handleSectionChange} currentSection={currentSection} />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-center text-muted-foreground">Create professional resumes with our classic template format</p>
          </div>

          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
