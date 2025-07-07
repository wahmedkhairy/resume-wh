
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
  experienceType: "fulltime" | "remote" | "internship";
  writingStyle: "bullets" | "paragraph";
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
      experienceType: "fulltime",
      writingStyle: "bullets"
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

  const updateExperience = (id: string, field: keyof WorkExperience, value: string | string[] | "fulltime" | "remote" | "internship" | "bullets" | "paragraph") => {
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

  const removeResponsibility = (expId: string, index: number) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === expId 
        ? { 
            ...exp, 
            responsibilities: exp.responsibilities.filter((_, i) => i !== index)
          }
        : exp
    );
    setExperiences(updatedExperiences);
    if (onExperienceChange) {
      onExperienceChange(updatedExperiences);
    }
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
            <div key={experience.id} className="border border-gray-200 rounded-lg p-4 relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeExperience(experience.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              {/* Experience Type Selection */}
              <div className="mb-4">
                <RadioGroup
                  value={experience.experienceType}
                  onValueChange={(value) => updateExperience(experience.id, "experienceType", value as "fulltime" | "remote" | "internship")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fulltime" id={`fulltime-${experience.id}`} />
                    <Label htmlFor={`fulltime-${experience.id}`} className="cursor-pointer">
                      Full Time Job
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="remote" id={`remote-${experience.id}`} />
                    <Label htmlFor={`remote-${experience.id}`} className="cursor-pointer">
                      Remote Job
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="internship" id={`internship-${experience.id}`} />
                    <Label htmlFor={`internship-${experience.id}`} className="cursor-pointer">
                      Internship
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
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
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`location-${experience.id}`}>Location</Label>
                  <Input
                    id={`location-${experience.id}`}
                    placeholder="New York, NY"
                    value={experience.location}
                    onChange={(e) => updateExperience(experience.id, "location", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Responsibilities</Label>
                  <RadioGroup
                    value={experience.writingStyle}
                    onValueChange={(value) => updateExperience(experience.id, "writingStyle", value as "bullets" | "paragraph")}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bullets" id={`bullets-${experience.id}`} />
                      <Label htmlFor={`bullets-${experience.id}`} className="cursor-pointer text-sm">
                        Bullet Points
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paragraph" id={`paragraph-${experience.id}`} />
                      <Label htmlFor={`paragraph-${experience.id}`} className="cursor-pointer text-sm">
                        Paragraph
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {experience.writingStyle === "bullets" ? (
                  experience.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex gap-2">
                      <Textarea
                        placeholder="Describe your responsibility..."
                        value={responsibility}
                        onChange={(e) => updateResponsibility(experience.id, index, e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeResponsibility(experience.id, index)}
                        disabled={experience.responsibilities.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <Textarea
                    placeholder="Describe your responsibilities in paragraph format..."
                    value={experience.responsibilities[0] || ""}
                    onChange={(e) => updateExperience(experience.id, "responsibilities", [e.target.value])}
                    className="min-h-[120px]"
                  />
                )}
                
                {experience.writingStyle === "bullets" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addResponsibility(experience.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Responsibility
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addExperience}
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
