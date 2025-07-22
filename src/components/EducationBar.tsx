
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  location: string;
}

interface EducationBarProps {
  onEducationChange: (education: Education[]) => void;
  initialEducation: Education[];
}

const EducationBar: React.FC<EducationBarProps> = ({
  onEducationChange,
  initialEducation = []
}) => {
  const [education, setEducation] = useState<Education[]>(initialEducation);

  useEffect(() => {
    setEducation(initialEducation);
  }, [initialEducation]);

  const updateEducation = (updatedEducation: Education[]) => {
    setEducation(updatedEducation);
    onEducationChange(updatedEducation);
  };

  const handleFieldChange = (id: string, field: keyof Education, value: string) => {
    const updatedEducation = education.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    updateEducation(updatedEducation);
  };

  const handleAddEducation = () => {
    const newEducation: Education = {
      id: `education-${Date.now()}`,
      degree: "",
      institution: "",
      graduationYear: "",
      gpa: "",
      location: ""
    };
    const updatedEducation = [...education, newEducation];
    updateEducation(updatedEducation);
  };

  const handleDeleteEducation = (id: string) => {
    const updatedEducation = education.filter(edu => edu.id !== id);
    updateEducation(updatedEducation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="border rounded p-4 space-y-3">
            <div className="flex justify-end items-start mb-2">
              <Button
                onClick={() => handleDeleteEducation(edu.id)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                <Input
                  id={`degree-${edu.id}`}
                  value={edu.degree}
                  onChange={(e) => handleFieldChange(edu.id, 'degree', e.target.value)}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                <Input
                  id={`institution-${edu.id}`}
                  value={edu.institution}
                  onChange={(e) => handleFieldChange(edu.id, 'institution', e.target.value)}
                  placeholder="University Name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`year-${edu.id}`}>Graduation Year</Label>
                <Input
                  id={`year-${edu.id}`}
                  value={edu.graduationYear}
                  onChange={(e) => handleFieldChange(edu.id, 'graduationYear', e.target.value)}
                  placeholder="2024"
                />
              </div>
              <div>
                <Label htmlFor={`gpa-${edu.id}`}>GPA (Optional)</Label>
                <Input
                  id={`gpa-${edu.id}`}
                  value={edu.gpa || ""}
                  onChange={(e) => handleFieldChange(edu.id, 'gpa', e.target.value)}
                  placeholder="3.8"
                />
              </div>
              <div>
                <Label htmlFor={`location-${edu.id}`}>Location</Label>
                <Input
                  id={`location-${edu.id}`}
                  value={edu.location}
                  onChange={(e) => handleFieldChange(edu.id, 'location', e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={handleAddEducation} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </CardContent>
    </Card>
  );
};

export default EducationBar;
