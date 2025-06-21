
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeData } from "@/hooks/useResumeData";
import { useSubscription } from "@/hooks/useSubscription";
import { exportResumeAsText } from "@/utils/resumeExport";

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

  // Fix: Create properly structured resume data object (not function)
  const currentResumeData = useMemo(() => {
    const resumeData = tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications
    };
    
    console.log('Index.tsx - currentResumeData created:', resumeData);
    return resumeData;
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
    console.log('=== handleExportResume called ===');
    console.log('Current resume data:', currentResumeData);
    
    // Validate data structure before export
    if (!currentResumeData || typeof currentResumeData !== 'object') {
      console.error('Invalid export data structure:', currentResumeData);
      toast({
        title: "Export Error",
        description: "Invalid resume data. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if required data exists
    if (!currentResumeData.personalInfo) {
      console.error('Missing personal info in export data');
      toast({
        title: "Export Error",
        description: "Personal information is required for export.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await handleExport(currentResumeData);
    } catch (error) {
      console.error('Export failed in Index.tsx:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Export failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportResumeAsWord = async () => {
    console.log('=== handleExportResumeAsWord called ===');
    console.log('Current resume data:', currentResumeData);
    
    // Validate data structure before export
    if (!currentResumeData || typeof currentResumeData !== 'object') {
      console.error('Invalid export data structure:', currentResumeData);
      toast({
        title: "Export Error",
        description: "Invalid resume data. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if required data exists
    if (!currentResumeData.personalInfo) {
      console.error('Missing personal info in export data');
      toast({
        title: "Export Error",
        description: "Personal information is required for export.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await handleWordExport(currentResumeData);
    } catch (error) {
      console.error('Word export failed in Index.tsx:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Word export failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportResumeAsText = () => {
    console.log('=== handleExportResumeAsText called ===');
    console.log('Current resume data:', currentResumeData);
    
    try {
      exportResumeAsText(currentResumeData);
    } catch (error) {
      console.error('Text export failed:', error);
      toast({
        title: "Export Failed",
        description: "Text export failed. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleClearTailoredResume = () => {
    setTailoredResumeData(null);
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

          <MainContent
            currentSection={currentSection}
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
            tailoredResumeData={tailoredResumeData}
            onClearTailoredResume={handleClearTailoredResume}
            onTailoredResumeGenerated={handleTailoredResumeGenerated}
            onSectionChange={setCurrentSection}
            currentUserId={currentUserId}
            isPremiumUser={isPremiumUser}
            currentSubscription={currentSubscription}
            isSaving={isSaving}
            isExporting={isExporting}
            sessionId={sessionId}
            onSave={handleSave}
            onExport={handleExportResume}
            onExportWord={handleExportResumeAsWord}
            canExport={canExport}
            getCurrentResumeData={currentResumeData}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
