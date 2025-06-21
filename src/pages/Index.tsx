import React, { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import ResumeData from "@/components/ResumeData";
import PreviewSection from "@/components/PreviewSection";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import ExportControls from "@/components/ExportControls";
import CallToAction from "@/components/CallToAction";
import UserSuccessStories from "@/components/UserSuccessStories";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeData } from "@/hooks/useResumeData";
import { useSubscription } from "@/hooks/useSubscription";
import { exportResumeAsText } from "@/utils/resumeExport";
import Footer from "@/components/Footer";

// Lazy load heavy components for better performance
const SettingsSection = lazy(() => import("@/components/SettingsSection"));
const ATSSection = lazy(() => import("@/components/ATSSection"));
const TailoredResumeSection = lazy(() => import("@/components/TailoredResumeSection"));

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

const Index = () => {
  const [currentSection, setCurrentSection] = useState("editor");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [sessionId] = useState(`session_${Date.now()}`);
  const [tailoredResumeData, setTailoredResumeData] = useState<any>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
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
    canExport,
  } = useSubscription(currentUserId);

  // Optimize user authentication check
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsPageLoading(false);
      }
    };
    
    checkUser();
  }, []);

  // Memoize current resume data to prevent unnecessary re-renders
  const getCurrentResumeData = useMemo(() => {
    return tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };
  }, [tailoredResumeData, personalInfo, resumeState.summary, workExperience, education, skills, coursesAndCertifications]);

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
    await handleExport(getCurrentResumeData);
  };

  const handleExportResumeAsText = () => {
    exportResumeAsText(getCurrentResumeData);
  };

  const handleExportResumeAsWord = async () => {
    await handleWordExport(getCurrentResumeData);
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Clear targeted resume data when switching sections
    if (section !== "editor") {
      setTailoredResumeData(null);
    }
  };

  const handleTailoredResumeGenerated = (tailoredData: any) => {
    setTailoredResumeData(tailoredData);
    toast({
      title: "Targeted Resume Ready",
      description: "Your targeted resume is now displayed in the preview. You can export it or make further adjustments.",
    });
  };

  // Show loading skeleton while page is initializing
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <Navigation onSectionChange={() => {}} currentSection="editor" />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <LoadingSkeleton />
          </div>
        </main>
      </div>
    );
  }

  const renderMainContent = () => {
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
          summary: resumeState.summary,
          workExperience,
          education,
          skills,
          coursesAndCertifications,
        };
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <TailoredResumeSection
              resumeData={originalResumeData}
              currentUserId={currentUserId}
              isPremiumUser={isPremiumUser}
              currentSubscription={currentSubscription}
              onTailoredResumeGenerated={handleTailoredResumeGenerated}
            />
          </Suspense>
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
                      <h3 className="font-medium text-blue-900 dark:text-blue-100">Targeted Resume Active</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        You're viewing a targeted version of your resume.
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
                canExport={canExport()}
                currentSubscription={currentSubscription}
              />

              <SubscriptionStatus
                isPremiumUser={isPremiumUser}
                currentSubscription={currentSubscription}
              />

              {/* Success CTA after resume completion */}
              {personalInfo.name && workExperience.length > 0 && (
                <CallToAction 
                  variant="success"
                  onPrimaryClick={handleExportResume}
                  onSecondaryClick={() => setCurrentSection("ats")}
                  secondaryAction="Run ATS Analysis"
                />
              )}
              
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
                personalInfo={getCurrentResumeData.personalInfo}
                summary={getCurrentResumeData.summary}
                workExperience={getCurrentResumeData.workExperience}
                education={getCurrentResumeData.education}
                skills={getCurrentResumeData.skills}
                coursesAndCertifications={getCurrentResumeData.coursesAndCertifications}
                onSummaryChange={handleSummaryChange}
                isPremiumUser={isPremiumUser}
                currentUserId={currentUserId}
                sessionId={sessionId}
                onExport={handleExportResume}
                onExportWord={handleExportResumeAsWord}
                isExporting={isExporting}
                canExport={canExport()}
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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Professional Resume Builder</h1>
            <p className="text-muted-foreground">Create ATS-optimized resumes that get you hired faster</p>
          </div>

          {renderMainContent()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
