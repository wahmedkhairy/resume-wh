
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Trash2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  location: string;
}

interface EducationBarProps {
  onEducationChange?: (education: Education[]) => void;
  initialEducation?: Education[];
}

const EducationBar: React.FC<EducationBarProps> = ({ 
  onEducationChange,
  initialEducation = []
}) => {
  const [educations, setEducations] = useState<Education[]>(initialEducation);
  const { toast } = useToast();

  const addEducation = () => {
    const newEducation: Education = {
      id: `edu_${Date.now()}`,
      degree: "",
      institution: "",
      graduationYear: "",
      gpa: "",
      location: ""
    };
    
    const updatedEducations = [...educations, newEducation];
    setEducations(updatedEducations);
    if (onEducationChange) {
      onEducationChange(updatedEducations);
    }
  };

  const removeEducation = (id: string) => {
    const updatedEducations = educations.filter(edu => edu.id !== id);
    setEducations(updatedEducations);
    if (onEducationChange) {
      onEducationChange(updatedEducations);
    }
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    const updatedEducations = educations.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducations(updatedEducations);
    if (onEducationChange) {
      onEducationChange(updatedEducations);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>Add your educational background</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {educations.map((education) => (
            <div key={education.id} className="border border-gray-200 rounded-lg p-4 relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeEducation(education.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`degree-${education.id}`}>Degree</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id={`degree-${education.id}`}
                      placeholder="Bachelor of Science in Computer Science"
                      className="pl-9"
                      value={education.degree}
                      onChange={(e) => updateEducation(education.id, "degree", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`institution-${education.id}`}>Institution</Label>
                  <Input
                    id={`institution-${education.id}`}
                    placeholder="University of Technology"
                    value={education.institution}
                    onChange={(e) => updateEducation(education.id, "institution", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`graduationYear-${education.id}`}>Graduation Year</Label>
                  <Input
                    id={`graduationYear-${education.id}`}
                    placeholder="2020"
                    value={education.graduationYear}
                    onChange={(e) => updateEducation(education.id, "graduationYear", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`gpa-${education.id}`}>GPA (Optional)</Label>
                  <Input
                    id={`gpa-${education.id}`}
                    placeholder="3.8"
                    value={education.gpa}
                    onChange={(e) => updateEducation(education.id, "gpa", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`location-${education.id}`}>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id={`location-${education.id}`}
                      placeholder="Boston, MA"
                      className="pl-9"
                      value={education.location}
                      onChange={(e) => updateEducation(education.id, "location", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addEducation}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationBar;
