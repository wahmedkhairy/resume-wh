
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClassicResumePreview from "@/components/ClassicResumePreview";
import ATSProResumePreview from "@/components/ATSProResumePreview";
import SummaryEditor from "@/components/SummaryEditor";

interface PersonalInfo {
  name: string;
  jobTitle: string;
  location: string;
  email: string;
  phone: string;
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

interface ResumePreviewProps {
  watermark?: boolean;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  onSummaryChange: (summary: string) => void;
}

const getSummaryDisplayText = (summary: string) => {
  if (!summary || summary.trim().length === 0) {
    return `💡 Professional Summary Writing Tips:

• Start with your job title and highlight 2-3 key achievements with specific numbers
• Mention your most relevant skills for the target role and keep it to 3-4 sentences maximum`;
  }
  return summary;
};

const ResumePreview: React.FC<ResumePreviewProps> = ({
  watermark = false,
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
  onSummaryChange,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");

  const displaySummary = getSummaryDisplayText(summary);

  const commonProps = {
    watermark,
    personalInfo,
    summary: displaySummary,
    workExperience,
    education,
    skills,
    coursesAndCertifications,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resume Templates</h3>
        <div className="flex gap-2">
          <Badge variant={selectedTemplate === "classic" ? "default" : "outline"}>
            Professional
          </Badge>
          <Badge variant={selectedTemplate === "ats-pro" ? "default" : "outline"}>
            ATS Optimized
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTemplate} onValueChange={setSelectedTemplate} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classic">Classic Professional</TabsTrigger>
          <TabsTrigger value="ats-pro">ATS Pro</TabsTrigger>
        </TabsList>
        
        <TabsContent value="classic" className="mt-4">
          <div className="border rounded-lg bg-white overflow-hidden">
            <ClassicResumePreview {...commonProps} />
          </div>
        </TabsContent>
        
        <TabsContent value="ats-pro" className="mt-4">
          <div className="border rounded-lg bg-white overflow-hidden">
            <ATSProResumePreview {...commonProps} />
          </div>
        </TabsContent>
      </Tabs>

      {!summary && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            📝 <strong>Ready to add your professional summary?</strong>
          </p>
          <p className="text-xs text-blue-600">
            A well-written summary can increase your interview chances by 40%. Use the tips shown above to craft a compelling introduction.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
