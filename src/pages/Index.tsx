
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
import { useResumeData } from "@/hooks/useResumeData";
import { useSubscription } from "@/hooks/useSubscription";

const Index = () => {
  const [currentSection, setCurrentSection] = useState("editor");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [sessionId] = useState(`session_${Date.now()}`);
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
    const exportData = {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };

    await handleExport(exportData);
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const renderMainContent = () => {
    switch (currentSection) {
      case "settings":
        return <SettingsSection />;
      
      case "ats":
        return <ATSSection />;
      
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-6 space-y-6">
              <ExportControls
                onSave={handleSave}
                onExport={handleExportResume}
                isSaving={isSaving}
                isExporting={isExporting}
                currentUserId={currentUserId}
                isPremiumUser={isPremiumUser}
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
                personalInfo={personalInfo}
                summary={resumeState.summary}
                workExperience={workExperience}
                education={education}
                skills={skills}
                coursesAndCertifications={coursesAndCertifications}
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
            <p className="text-center text-muted-foreground">Create ATS-optimized resumes with AI-powered content generation</p>
          </div>

          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
