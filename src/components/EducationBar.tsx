
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

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
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEducation, setNewEducation] = useState<Education>({
    id: "",
    degree: "",
    institution: "",
    graduationYear: "",
    gpa: "",
    location: ""
  });

  const handleAddEducation = () => {
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      const educationWithId = {
        ...newEducation,
        id: `education-${Date.now()}`
      };
      const updatedEducation = [...education, educationWithId];
      setEducation(updatedEducation);
      onEducationChange(updatedEducation);
      setNewEducation({
        id: "",
        degree: "",
        institution: "",
        graduationYear: "",
        gpa: "",
        location: ""
      });
      setIsAdding(false);
    }
  };

  const handleEditEducation = (education: Education) => {
    setEditingId(education.id);
    setNewEducation(education);
  };

  const handleUpdateEducation = () => {
    const updatedEducation = education.map(edu =>
      edu.id === editingId ? newEducation : edu
    );
    setEducation(updatedEducation);
    onEducationChange(updatedEducation);
    setEditingId(null);
    setNewEducation({
      id: "",
      degree: "",
      institution: "",
      graduationYear: "",
      gpa: "",
      location: ""
    });
  };

  const handleDeleteEducation = (id: string) => {
    const updatedEducation = education.filter(edu => edu.id !== id);
    setEducation(updatedEducation);
    onEducationChange(updatedEducation);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewEducation({
      id: "",
      degree: "",
      institution: "",
      graduationYear: "",
      gpa: "",
      location: ""
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="border rounded p-4 space-y-2">
            {editingId === edu.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edit-degree-${edu.id}`}>Degree</Label>
                    <Input
                      id={`edit-degree-${edu.id}`}
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-institution-${edu.id}`}>Institution</Label>
                    <Input
                      id={`edit-institution-${edu.id}`}
                      value={newEducation.institution}
                      onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                      placeholder="University Name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`edit-year-${edu.id}`}>Graduation Year</Label>
                    <Input
                      id={`edit-year-${edu.id}`}
                      value={newEducation.graduationYear}
                      onChange={(e) => setNewEducation({...newEducation, graduationYear: e.target.value})}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-gpa-${edu.id}`}>GPA (Optional)</Label>
                    <Input
                      id={`edit-gpa-${edu.id}`}
                      value={newEducation.gpa}
                      onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                      placeholder="3.8"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-location-${edu.id}`}>Location</Label>
                    <Input
                      id={`edit-location-${edu.id}`}
                      value={newEducation.location}
                      onChange={(e) => setNewEducation({...newEducation, location: e.target.value})}
                      placeholder="City, State"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateEducation} size="sm">
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution} | {edu.graduationYear} | {edu.location}
                    </p>
                    {edu.gpa && <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditEducation(edu)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteEducation(edu.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="border rounded p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-degree">Degree</Label>
                <Input
                  id="new-degree"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  placeholder="Bachelor of Science in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="new-institution">Institution</Label>
                <Input
                  id="new-institution"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                  placeholder="University Name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-year">Graduation Year</Label>
                <Input
                  id="new-year"
                  value={newEducation.graduationYear}
                  onChange={(e) => setNewEducation({...newEducation, graduationYear: e.target.value})}
                  placeholder="2024"
                />
              </div>
              <div>
                <Label htmlFor="new-gpa">GPA (Optional)</Label>
                <Input
                  id="new-gpa"
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                  placeholder="3.8"
                />
              </div>
              <div>
                <Label htmlFor="new-location">Location</Label>
                <Input
                  id="new-location"
                  value={newEducation.location}
                  onChange={(e) => setNewEducation({...newEducation, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEducation} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Check className="w-4 h-4 mr-1" />
                Add Education
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationBar;
