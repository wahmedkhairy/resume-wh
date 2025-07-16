
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { useResumeData } from "@/hooks/useResumeData";
import { useSubscription } from "@/hooks/useSubscription";

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
    projects,
    setProjects,
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

  // Initialize user authentication
  useEffect(() => {
    const initializeUser = async () => {
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
    
    initializeUser();
  }, []);

  // Create current resume data object
  const getCurrentResumeData = () => {
    return tailoredResumeData || {
      personalInfo,
      summary: resumeState.summary,
      workExperience,
      education,
      skills,
      coursesAndCertifications,
      projects
    };
  };

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

  const handleProjectsChange = (newProjects: any) => {
    setProjects(newProjects);
  };

  const handleSummaryChange = (newSummary: string) => {
    setResumeState(prev => ({
      ...prev,
      summary: newSummary
    }));
  };

  const handleExportResume = async () => {
    try {
      await handleExport(getCurrentResumeData());
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Export failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportResumeAsWord = async () => {
    try {
      await handleWordExport(getCurrentResumeData());
    } catch (error) {
      console.error('Word export failed:', error);
      toast({
        title: "Export Failed",
        description: "Word export failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
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

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <SEOHead
          title="Resume Builder - ATS-Optimized Resume Builder & Targeted Job Resume Generator"
          description="Create ATS-optimized resumes that get past applicant tracking systems and into the hands of recruiters. Free ATS resume scan and ATS score calculator to improve your hiring chances."
          canonicalUrl="https://resumewh.com/"
          keywords="resume builder, ATS resume builder, AI resume generator, professional resume template, job-winning resume, online CV maker, targeted resume generator, best ATS-friendly resume template 2025, AI resume builder for marketing manager, free cover letter and resume builder, ATS resume checker, check if resume passes ATS, free ATS resume scan, optimize resume for ATS"
          ogTitle="Resume Builder - ATS-Optimized Resume Builder & Targeted Job Resume Generator"
          ogDescription="Create resumes that pass any Applicant Tracking System with a 100% success rate. Free ATS compatibility test and resume scanner online."
          ogUrl="https://resumewh.com/"
          twitterTitle="Resume Builder - ATS-Optimized Resume Builder & Targeted Job Resume Generator"
          twitterDescription="Create ATS-optimized resumes that get past applicant tracking systems. Includes AI-powered resume check to improve resume for applicant tracking systems."
        />
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
      <SEOHead
        title="Resume Builder - ATS-Optimized Resume Builder & Targeted Job Resume Generator"
        description="Create ATS-optimized resumes that get past applicant tracking systems and into the hands of recruiters. Free ATS resume scan and ATS score calculator to improve your hiring chances."
        canonicalUrl="https://resumewh.com/"
        keywords="resume builder, ATS resume builder, AI resume generator, professional resume template, job-winning resume, online CV maker, targeted resume generator, best ATS-friendly resume template 2025, AI resume builder for marketing manager, free cover letter and resume builder, ATS resume checker, check if resume passes ATS, free ATS resume scan, optimize resume for ATS"
        ogTitle="Resume Builder - ATS-Optimized Resume Builder & Targeted Job Resume Generator"
        ogDescription="Create resumes that pass any Applicant Tracking System with a 100% success rate. Free ATS compatibility test and resume scanner online."
        ogUrl="https://resumewh.com/"
        twitterTitle="Resume Builder - ATS-Optimized Resume Builder & Targeted Job Resume Generator"
        twitterDescription="Create ATS-optimized resumes that get past applicant tracking systems. Includes AI-powered resume check to improve resume for applicant tracking systems."
      />
      <Header />
      <Navigation onSectionChange={handleSectionChange} currentSection={currentSection} />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {currentSection === "editor" && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Professional Resume Builder</h1>
              <p className="text-muted-foreground">Create ATS-optimized resumes that get you hired faster</p>
            </div>
          )}

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
            projects={projects}
            onProjectsChange={handleProjectsChange}
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
            getCurrentResumeData={getCurrentResumeData()}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
