
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import SectionEditor from "@/components/SectionEditor";
import ResumePreview from "@/components/ResumePreview";
import ATSScanner from "@/components/ATSScanner";
import KeywordMatcher from "@/components/KeywordMatcher";
import SkillsBar from "@/components/SkillsBar";
import CoursesAndCertifications from "@/components/CoursesAndCertifications";
import SubscriptionOverlay from "@/components/SubscriptionOverlay";
import PersonalInfoBar, { PersonalInfo } from "@/components/PersonalInfoBar";
import { Button } from "@/components/ui/button";
import { Download, Wand2 } from "lucide-react";
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
  const [showSubscription, setShowSubscription] = useState(false);
  const [resumeData, setResumeData] = useState({
    summary: "Passionate frontend developer with 5+ years of experience building responsive web applications using React, TypeScript, and modern CSS frameworks. Committed to creating exceptional user experiences through clean, efficient code and intuitive design.",
    experience: "Senior Frontend Developer - Tech Solutions Inc.\nJanuary 2020 - Present\n\n- Led development of company's flagship SaaS product using React and TypeScript\n- Improved application performance by 40% through code optimization and efficient state management\n- Collaborated with UX designers to implement responsive interfaces across all devices\n- Mentored junior developers and conducted code reviews to ensure code quality",
    education: "Bachelor of Science in Computer Science\nNew York University - 2018",
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "John Doe",
    jobTitle: "Frontend Developer",
    location: "New York, NY",
    email: "john@example.com",
    phone: "(123) 456-7890"
  });
  const [skills, setSkills] = useState<Skill[]>([
    { id: "1", name: "React", level: 85 },
    { id: "2", name: "TypeScript", level: 75 },
    { id: "3", name: "CSS/Tailwind", level: 90 },
  ]);
  const [coursesAndCertifications, setCoursesAndCertifications] = useState<Course[]>([
    {
      id: "1",
      title: "Advanced React Development",
      provider: "Frontend Masters",
      date: "2024",
      description: "Covered advanced React patterns, hooks, and performance optimization",
      type: "course",
    },
    {
      id: "2",
      title: "AWS Certified Solutions Architect",
      provider: "Amazon Web Services",
      date: "2023",
      description: "Professional certification for designing distributed systems on AWS",
      type: "certification",
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const { toast } = useToast();

  // Check if user is a premium subscriber from localStorage
  useEffect(() => {
    const checkSubscriptionStatus = () => {
      const subscriptionStatus = localStorage.getItem('isPremiumUser');
      if (subscriptionStatus === 'true') {
        setIsPremiumUser(true);
      }
    };
    
    checkSubscriptionStatus();
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
    
    // If user is premium, allow export
    if (isPremiumUser) {
      setTimeout(() => {
        setIsExporting(false);
        toast({
          title: "Resume Exported",
          description: "Your resume has been exported successfully.",
        });
      }, 1000);
    } else {
      // Show subscription overlay for non-premium users
      setTimeout(() => {
        setIsExporting(false);
        setShowSubscription(true);
      }, 500);
    }
  };

  // This function will be called when a user successfully subscribes
  const handleSubscriptionComplete = () => {
    setIsPremiumUser(true);
    localStorage.setItem('isPremiumUser', 'true');
    setShowSubscription(false);
    toast({
      title: "Premium Access Granted!",
      description: "Thank you for subscribing. You now have full access to all premium features.",
    });
  };

  const handleGenerateSummary = async () => {
    // Validate that experience section has content
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
      try {
        // Try calling the API first
        const response = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: resumeData.experience }),
        });
        
        if (!response.ok) {
          throw new Error('API unavailable');
        }
        
        const data = await response.json();
        
        if (data?.summary) {
          setResumeData(prev => ({
            ...prev,
            summary: data.summary
          }));
          toast({
            title: "Summary Generated",
            description: "Your professional summary has been generated based on your experience.",
            variant: "default",
          });
          return;
        }
        
        throw new Error('Invalid API response');
      } catch (apiError) {
        console.log('API error, using fallback:', apiError);
        
        // Basic fallback summary generator
        let experienceParts = resumeData.experience.split('\n').filter(line => line.trim());
        let jobTitle = experienceParts[0] || 'professional';
        let years = '5+';
        
        // Try to extract years of experience
        const yearMatch = resumeData.experience.match(/(\d+)(?:\+)?\s*(?:year|yr)s?/i);
        if (yearMatch) {
          years = yearMatch[0];
        }
        
        // Extract skills mentioned in experience
        const techSkills = ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript', 'Node.js', 'Vue', 'Angular'];
        const mentionedSkills = techSkills.filter(skill => 
          resumeData.experience.toLowerCase().includes(skill.toLowerCase())
        );
        
        const skillsText = mentionedSkills.length > 0 
          ? mentionedSkills.slice(0, 3).join(', ') 
          : 'frontend development technologies';
        
        const fallbackSummary = `Dedicated ${jobTitle.toLowerCase().includes('senior') ? 'senior' : ''} professional with ${years} experience in ${skillsText}. Proven track record of delivering high-quality solutions, optimizing application performance, and collaborating effectively with cross-functional teams. Committed to creating exceptional user experiences through clean, efficient code and intuitive design.`;
        
        setResumeData(prev => ({
          ...prev,
          summary: fallbackSummary
        }));
        
        toast({
          title: "Summary Generated",
          description: "Your summary has been generated using local processing.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "There was an error generating your summary. Please try again later.",
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Editor */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                <h1 className="text-xl font-bold">Resume Editor</h1>
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
                    disabled={isExporting}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export Resume"}
                  </Button>
                </div>
              </div>
              
              <PersonalInfoBar 
                onInfoChange={handlePersonalInfoChange}
                initialInfo={personalInfo}
              />
              
              <SectionEditor
                title="Professional Summary"
                description="A brief overview of your professional background and key strengths"
                placeholder="Experienced software developer with expertise in..."
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
              
              <SkillsBar />
              
              <CoursesAndCertifications />
              
              <KeywordMatcher />
            </div>
            
            {/* Right Column - Preview & ATS */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">ATS Preview</h2>
                <div className="border rounded-lg h-[500px] overflow-auto bg-white">
                  <ResumePreview 
                    watermark={!isPremiumUser}
                    personalInfo={personalInfo}
                    summary={resumeData.summary}
                    experience={resumeData.experience}
                    education={resumeData.education}
                    skills={skills}
                    coursesAndCertifications={coursesAndCertifications}
                  />
                </div>
              </div>
              
              <ATSScanner />
            </div>
          </div>
        </div>
      </main>
      
      {showSubscription && (
        <SubscriptionOverlay 
          onClose={() => setShowSubscription(false)}
          onSubscriptionComplete={handleSubscriptionComplete}
        />
      )}
    </div>
  );
};

export default Index;
