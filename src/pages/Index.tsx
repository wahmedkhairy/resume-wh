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
      coursesAndCertifications
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

  // SEO content based on current section
  const getSEOContent = () => {
    switch (currentSection) {
      case "ats":
        return {
          title: "Free ATS Resume Scanner & Checker - Optimize for Applicant Tracking Systems",
          description: "Test your resume against ATS systems for free. Our AI-powered scanner identifies optimization opportunities and ensures your CV passes applicant tracking software used by top employers.",
          keywords: "ATS resume scanner, applicant tracking system checker, resume optimization, ATS-friendly resume template, job application scanner",
          ogTitle: "Free ATS Resume Scanner - Check Your Resume Score",
          ogDescription: "Scan your resume for ATS compatibility and get instant feedback on how to improve your job application success rate."
        };
      case "tailor":
        return {
          title: "AI Resume Tailor - Generate Targeted Resumes for Specific Jobs",
          description: "Create job-specific resumes with our AI resume generator. Tailor your CV for each application and increase your chances of landing interviews with targeted resume content.",
          keywords: "targeted resume generator, AI resume builder, job-specific resume, tailored CV maker, resume customization",
          ogTitle: "AI-Powered Targeted Resume Generator",
          ogDescription: "Generate customized resumes for specific job applications using advanced AI technology."
        };
      default:
        return {
          title: "Professional Resume Builder - Create ATS-Optimized Resumes Online Free",
          description: "Build professional, ATS-friendly resumes with our AI-powered resume builder. Create job-winning CVs, export to PDF/Word, and land more interviews. Free resume templates for all career levels.",
          keywords: "resume builder, ATS resume builder, AI resume generator, online CV maker, professional resume template, free resume maker, job-winning resume",
          ogTitle: "Best ATS Resume Builder 2025 - Create Professional CVs Online",
          ogDescription: "Create professional resumes that pass ATS systems and impress recruiters. Free resume builder with AI-powered optimization and professional templates."
        };
    }
  };

  const seoContent = getSEOContent();

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <SEOHead {...seoContent} canonicalUrl="https://resumewh.com/" />
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
      <SEOHead {...seoContent} canonicalUrl={`https://resumewh.com/${currentSection === 'editor' ? '' : currentSection}`} />
      <Header />
      <Navigation onSectionChange={handleSectionChange} currentSection={currentSection} />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {currentSection === "editor" && (
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Professional ATS Resume Builder - Create Job-Winning CVs Online
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Build ATS-optimized resumes with our AI-powered resume generator. Create professional CVs that pass applicant tracking systems and land more interviews. 
                <span className="font-semibold"> Free resume templates</span> for freshers and experienced professionals.
              </p>
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
