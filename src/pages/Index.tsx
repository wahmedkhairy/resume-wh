
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
import { Button } from "@/components/ui/button";
import { Download, Wand2, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const Index = () => {
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [resumeData, setResumeData] = useState({
    summary: "",
    experience: "",
    education: "",
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    jobTitle: "",
    location: "",
    email: "",
    phone: ""
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [coursesAndCertifications, setCoursesAndCertifications] = useState<Course[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleContentChange = (section: string, content: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: content
    }));
  };

  const handlePersonalInfoChange = (info: PersonalInfo) => {
    setPersonalInfo(info);
  };

  const handleSkillsChange = (newSkills: Skill[]) => {
    setSkills(newSkills);
  };

  const handleCoursesChange = (newCourses: Course[]) => {
    setCoursesAndCertifications(newCourses);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    if (isPremiumUser && currentSubscription && currentSubscription.scan_count > 0) {
      setTimeout(() => {
        setIsExporting(false);
        toast({
          title: "Resume Exported",
          description: "Your resume has been exported successfully.",
        });
        
        // Decrement scan count
        supabase
          .from('subscriptions')
          .update({ scan_count: currentSubscription.scan_count - 1 })
          .eq('user_id', currentUserId);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsExporting(false);
        toast({
          title: "Upgrade Required",
          description: "Please upgrade your plan to export resumes.",
          variant: "destructive",
        });
      }, 500);
    }
  };

  const handleGenerateSummary = async () => {
    if (!resumeData.experience.trim()) {
      toast({
        title: "No Experience Data",
        description: "Please add work experience details first to generate a relevant summary.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { 
          experience: resumeData.experience,
          education: resumeData.education,
          skills: skills,
          personalInfo: personalInfo
        }
      });
      
      if (error) throw error;
      
      if (data?.summary) {
        setResumeData(prev => ({
          ...prev,
          summary: data.summary
        }));
        toast({
          title: "Summary Generated",
          description: "Your professional summary has been generated using AI.",
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating your summary. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">Resume Builder</h1>
            <p className="text-center text-muted-foreground">Create ATS-optimized resumes with AI-powered content generation</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                <h2 className="text-xl font-bold">Resume Editor</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleGenerateSummary} 
                    disabled={isGenerating}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isGenerating ? "Generating..." : "Generate Summary"}
                  </Button>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting || (!isPremiumUser)}
                  >
                    {!isPremiumUser ? <Lock className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
                    {isExporting ? "Exporting..." : "Export Resume"}
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
                      {currentSubscription.scan_count} scans remaining
                    </span>
                  </div>
                </div>
              )}
              
              <PersonalInfoBar 
                onInfoChange={handlePersonalInfoChange}
                initialInfo={personalInfo}
              />
              
              <SectionEditor
                title="Professional Summary"
                description="A brief overview of your professional background and key strengths"
                placeholder="Your professional summary will be generated automatically..."
                initialContent={resumeData.summary}
                sectionType="summary"
                onContentChange={(content) => handleContentChange("summary", content)}
              />
              
              <SectionEditor
                title="Work Experience"
                description="List your work history in reverse chronological order"
                placeholder="Job title, company, date range, and responsibilities..."
                initialContent={resumeData.experience}
                sectionType="experience"
                onContentChange={(content) => handleContentChange("experience", content)}
              />
              
              <SectionEditor
                title="Education"
                description="List your educational background"
                placeholder="Degree, institution, graduation year..."
                initialContent={resumeData.education}
                sectionType="education"
                onContentChange={(content) => handleContentChange("education", content)}
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
                <div className="border rounded-lg h-[600px] overflow-auto bg-white relative">
                  <ResumePreview 
                    watermark={!isPremiumUser}
                    personalInfo={personalInfo}
                    summary={resumeData.summary}
                    experience={resumeData.experience}
                    education={resumeData.education}
                    skills={[]} // Skills not shown in preview as per requirements
                    coursesAndCertifications={coursesAndCertifications}
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
        </div>
      </main>
    </div>
  );
};

export default Index;
