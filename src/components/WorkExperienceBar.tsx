
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WritingStyleSelector from "./WritingStyleSelector";
import ExperienceTypeSelector from "./ExperienceTypeSelector";

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
  experienceType?: string;
  writingStyle?: "bullet" | "paragraph";
}

interface WorkExperienceBarProps {
  onExperienceChange?: (experience: WorkExperience[]) => void;
  initialExperience?: WorkExperience[];
}

const WorkExperienceBar: React.FC<WorkExperienceBarProps> = ({ 
  onExperienceChange,
  initialExperience = []
}) => {
  const [experiences, setExperiences] = useState<WorkExperience[]>(initialExperience);
  const { toast } = useToast();

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: `exp_${Date.now()}`,
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      location: "",
      responsibilities: [""],
      experienceType: "full-time",
      writingStyle: "bullet"
    };
    
    const updatedExperiences = [...experiences, newExperience];
    setExperiences(updatedExperiences);
    if (onExperienceChange) {
      onExperienceChange(updatedExperiences);
    }
  };

  const removeExperience = (id: string) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id);
    setExperiences(updatedExperiences);
    if (onExperienceChange) {
      onExperienceChange(updatedExperiences);
    }
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | string[] | "bullet" | "paragraph") => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    setExperiences(updatedExperiences);
    if (onExperienceChange) {
      onExperienceChange(updatedExperiences);
    }
  };

  const addResponsibility = (expId: string) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === expId 
        ? { ...exp, responsibilities: [...exp.responsibilities, ""] }
        : exp
    );
    setExperiences(updatedExperiences);
    if (onExperienceChange) {
      onExperienceChange(updatedExperiences);
    }
  };

  const updateResponsibility = (expId: string, index: number, value: string) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === expId 
        ? { 
            ...exp, 
            responsibilities: exp.responsibilities.map((resp, i) => i === index ? value : resp)
          }
        : exp
    );
    setExperiences(updatedExperiences);
    if (onExperienceChange) {
      onExperienceChange(updatedExperiences);
    }
  };

  const formatResponsibilityText = (text: string, writingStyle: "bullet" | "paragraph") => {
    if (writingStyle === "bullet" && text && !text.startsWith("• ")) {
      return `• ${text}`;
    }
    return text;
  };

  const handleResponsibilityChange = (expId: string, index: number, newValue: string, writingStyle: "bullet" | "paragraph") => {
    if (writingStyle === "bullet") {
      // Handle bullet point formatting
      const lines = newValue.split('\n');
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith("• ")) {
          return `• ${trimmedLine}`;
        }
        return line;
      });
      updateResponsibility(expId, index, formattedLines.join('\n'));
    } else {
      updateResponsibility(expId, index, newValue);
    }
  };

  const getPlaceholderText = (writingStyle: "bullet" | "paragraph") => {
    if (writingStyle === "bullet") {
      return "• Describe your key responsibility or achievement here\n• Add quantifiable results with numbers or percentages\n• Include specific technologies, tools, or methodologies used";
    }
    return "Describe your responsibilities and achievements in paragraph format. Include specific details about your role, accomplishments, and the impact you made in this position.";
  };

  const getResponsibilityValue = (responsibility: string, writingStyle: "bullet" | "paragraph") => {
    if (writingStyle === "bullet" && responsibility && !responsibility.includes("• ")) {
      return `• ${responsibility}`;
    }
    return responsibility;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>Add your professional work history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {experiences.map((experience) => (
            <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`jobTitle-${experience.id}`}>Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id={`jobTitle-${experience.id}`}
                      placeholder="Software Engineer"
                      className="pl-9"
                      value={experience.jobTitle}
                      onChange={(e) => updateExperience(experience.id, "jobTitle", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`company-${experience.id}`}>Company</Label>
                  <Input
                    id={`company-${experience.id}`}
                    placeholder="Tech Corp"
                    value={experience.company}
                    onChange={(e) => updateExperience(experience.id, "company", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${experience.id}`}
                    placeholder="January 2020"
                    value={experience.startDate}
                    onChange={(e) => updateExperience(experience.id, "startDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${experience.id}`}
                    placeholder="Present"
                    value={experience.endDate}
                    onChange={(e) => updateExperience(experience.id, "endDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`location-${experience.id}`}>Location</Label>
                  <Input
                    id={`location-${experience.id}`}
                    placeholder="New York, NY"
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, "location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience Type</Label>
                  <ExperienceTypeSelector
                    value={experience.experienceType || "full-time"}
                    onChange={(value) => updateExperience(experience.id, "experienceType", value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Responsibilities</Label>
                <WritingStyleSelector
                  value={experience.writingStyle || "bullet"}
                  onChange={(value) => updateExperience(experience.id, "writingStyle", value)}
                  className="mb-2"
                />
                {experience.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      placeholder={getPlaceholderText(experience.writingStyle || "bullet")}
                      value={getResponsibilityValue(responsibility, experience.writingStyle || "bullet")}
                      onChange={(e) => handleResponsibilityChange(experience.id, index, e.target.value, experience.writingStyle || "bullet")}
                      className="min-h-[80px] font-mono text-sm"
                      style={{
                        fontFamily: experience.writingStyle === "bullet" ? "monospace" : "inherit"
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    addResponsibility(experience.id);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Responsibility
                </Button>
              </div>
            </div>
          ))}
          
          <Button
            variant="default"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addExperience();
            }}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Work Experience
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkExperienceBar;
