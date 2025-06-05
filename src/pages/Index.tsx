
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import SectionEditor from "@/components/SectionEditor";
import ResumePreview from "@/components/ResumePreview";
import ATSScanner from "@/components/ATSScanner";
import KeywordMatcher from "@/components/KeywordMatcher";
import SkillsBar from "@/components/SkillsBar";
import CoursesAndCertifications from "@/components/CoursesAndCertifications";
import AntiTheftProtection from "@/components/AntiTheftProtection";
import PersonalInfoBar, { PersonalInfo } from "@/components/PersonalInfoBar";
import WorkExperienceBar from "@/components/WorkExperienceBar";
import EducationBar from "@/components/EducationBar";
import UserSettings from "@/components/UserSettings";
import SummaryEditor from "@/components/SummaryEditor";
import { Button } from "@/components/ui/button";
import { Download, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exportResumeToPDF } from "@/utils/resumeExport";

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

const Index = () => {
  const [currentSection, setCurrentSection] = useState("editor");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [resumeData, setResumeData] = useState({
    summary: "",
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    jobTitle: "",
    location: "",
    email: "",
    phone: ""
  });
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [coursesAndCertifications, setCoursesAndCertifications] = useState<Course[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [sessionId] = useState(`session_${Date.now()}`);
  const { toast } = useToast();

  // Check subscription status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Check subscription from database
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (subscription && subscription.scan_count > 0) {
          setIsPremiumUser(true);
          setCurrentSubscription(subscription);
        }
      }
    };
    
    checkUser();
  }, []);

  const handlePersonalInfoChange = (info: PersonalInfo) => {
    setPersonalInfo(info);
  };

  const handleWorkExperienceChange = (newExperience: WorkExperience[]) => {
    setWorkExperience(newExperience);
  };

  const handleEducationChange = (newEducation: Education[]) => {
    setEducation(newEducation);
  };

  const handleSkillsChange = (newSkills: Skill[]) => {
    setSkills(newSkills);
  };

  const handleCoursesChange = (newCourses: Course[]) => {
    setCoursesAndCertifications(newCourses);
  };

  const handleSummaryChange = (newSummary: string) => {
    setResumeData(prev => ({
      ...prev,
      summary: newSummary
    }));
  };

  const handleExport = async () => {
    if (!isPremiumUser || !currentSubscription || currentSubscription.scan_count <= 0) {
      toast({
        title: "Upgrade Required",
        description: "Please purchase export credits to download your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData = {
        personalInfo,
        summary: resumeData.summary,
        workExperience,
        education,
        skills,
        coursesAndCertifications
      };

      console.log('Starting export with data:', exportData);
      await exportResumeToPDF(exportData);
      
      // Decrement scan count
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ scan_count: currentSubscription.scan_count - 1 })
        .eq('user_id', currentUserId);
      
      if (updateError) {
        console.error('Error updating scan count:', updateError);
        throw updateError;
      }
      
      // Update local state
      setCurrentSubscription(prev => ({
        ...prev,
        scan_count: prev.scan_count - 1
      }));

      toast({
        title: "Resume Exported Successfully!",
        description: `Your resume has been downloaded as PDF. ${currentSubscription.scan_count - 1} exports remaining.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "There was an error exporting your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const renderMainContent = () => {
    switch (currentSection) {
      case "settings":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <UserSettings />
              </div>
            </div>
          </div>
        );
      
      case "ats":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-4">ATS Check</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">ATS Compatibility Score</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                        <p className="text-sm text-muted-foreground">Your resume is ATS-friendly</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Keyword Optimization</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-yellow-600 mb-2">72%</div>
                        <p className="text-sm text-muted-foreground">Consider adding more relevant keywords</p>
                      </div>
                    </div>
                  </div>
                  <ATSScanner />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                <h2 className="text-xl font-bold">Resume Editor</h2>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting || (!isPremiumUser)}
                    className={`${!isPremiumUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : isPremiumUser ? "Export Resume" : "🔒 Export Resume"}
                  </Button>
                </div>
              </div>

              {isPremiumUser && currentSubscription && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">
                        {currentSubscription.tier.charAt(0).toUpperCase() + currentSubscription.tier.slice(1)} Plan Active
                      </span>
                    </div>
                    <span className="text-green-600 font-medium">
                      {currentSubscription.scan_count} exports remaining
                    </span>
                  </div>
                </div>
              )}
              
              <PersonalInfoBar 
                onInfoChange={handlePersonalInfoChange}
                initialInfo={personalInfo}
              />
              
              <SummaryEditor
                initialSummary={resumeData.summary}
                onSummaryChange={handleSummaryChange}
                workExperience={workExperience}
                education={education}
                skills={skills}
                personalInfo={personalInfo}
              />
              
              <WorkExperienceBar 
                onExperienceChange={handleWorkExperienceChange}
                initialExperience={workExperience}
              />
              
              <EducationBar 
                onEducationChange={handleEducationChange}
                initialEducation={education}
              />
              
              <SkillsBar 
                onSkillsChange={handleSkillsChange}
                initialSkills={skills}
              />
              
              <CoursesAndCertifications 
                onCoursesChange={handleCoursesChange}
                initialCourses={coursesAndCertifications}
              />
              
              <KeywordMatcher />
            </div>
            
            {/* Right Column - Preview & ATS */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">ATS Preview</h2>
                <div className="border rounded-lg bg-white relative">
                  <ResumePreview 
                    watermark={!isPremiumUser}
                    personalInfo={personalInfo}
                    summary={resumeData.summary}
                    workExperience={workExperience}
                    education={education}
                    skills={skills}
                    coursesAndCertifications={coursesAndCertifications}
                    onSummaryChange={handleSummaryChange}
                  />
                  <AntiTheftProtection 
                    isActive={!isPremiumUser}
                    userId={currentUserId}
                    sessionId={sessionId}
                  />
                </div>
              </div>
              
              <ATSScanner />
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
