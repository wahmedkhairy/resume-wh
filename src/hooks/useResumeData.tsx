
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PersonalInfo } from "@/components/PersonalInfoBar";

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

export const useResumeData = (currentUserId: string) => {
  const [resumeState, setResumeState] = useState({
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadResumeData = async () => {
      if (!currentUserId) return;

      try {
        const { data: resume } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (resume) {
          setPersonalInfo((resume.personal_info as unknown as PersonalInfo) || {
            name: "",
            jobTitle: "",
            location: "",
            email: "",
            phone: ""
          });
          setResumeState({ summary: (resume.summary as string) || "" });
          setWorkExperience((resume.experience as unknown as WorkExperience[]) || []);
          setEducation((resume.education as unknown as Education[]) || []);
          setSkills((resume.skills as unknown as Skill[]) || []);
          setCoursesAndCertifications((resume.courses as unknown as Course[]) || []);
        }
      } catch (error) {
        console.error('Error loading resume data:', error);
      }
    };

    loadResumeData();
  }, [currentUserId]);

  const handleSave = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your resume.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const resumeData = {
        user_id: currentUserId,
        personal_info: personalInfo as any,
        summary: resumeState.summary,
        experience: workExperience as any,
        education: education as any,
        skills: skills as any,
        courses: coursesAndCertifications as any,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('resumes')
        .upsert(resumeData);

      if (error) throw error;

      toast({
        title: "Resume Saved",
        description: "Your resume has been saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
};
