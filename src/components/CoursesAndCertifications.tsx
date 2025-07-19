import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import WritingStyleSelector from "@/components/WritingStyleSelector";

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
  writingStyle?: "bullet" | "paragraph";
}

interface CoursesAndCertificationsProps {
  onCoursesChange: (courses: Course[]) => void;
  initialCourses: Course[];
}

const CoursesAndCertifications: React.FC<CoursesAndCertificationsProps> = ({
  onCoursesChange,
  initialCourses = []
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState<Course>({
    id: "",
    title: "",
    provider: "",
    date: "",
    description: "",
    type: "course",
    writingStyle: "bullet"
  });

  const formatBulletPoints = (text: string): string => {
    if (!text) return "";
    
    // Split by lines and process each line
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      // If line is empty, return empty
      if (!trimmedLine) return "";
      
      // Remove existing bullets first to avoid duplicates
      const cleanLine = trimmedLine.replace(/^[•\-\*]\s*/, '');
      
      // Add bullet only if there's actual content
      if (cleanLine) {
        return `• ${cleanLine}`;
      }
      
      return "";
    });
    
    return formattedLines.join('\n');
  };

  const handleDescriptionChange = (value: string, writingStyle: "bullet" | "paragraph" = "paragraph") => {
    if (writingStyle === "bullet") {
      const formattedValue = formatBulletPoints(value);
      setNewCourse({...newCourse, description: formattedValue});
    } else {
      setNewCourse({...newCourse, description: value});
    }
  };

  const getPlaceholderText = (writingStyle: "bullet" | "paragraph" = "paragraph") => {
    if (writingStyle === "bullet") {
      return "• Describe what you learned and key skills gained\n• Add specific achievements or certifications earned\n• Include relevant technologies or methodologies covered";
    }
    return "Describe what you learned and key skills gained...";
  };

  const handleAddCourse = () => {
    if (newCourse.title.trim() && newCourse.provider.trim()) {
      const courseWithId = {
        ...newCourse,
        id: `course-${Date.now()}`
      };
      const updatedCourses = [...courses, courseWithId];
      setCourses(updatedCourses);
      onCoursesChange(updatedCourses);
      setNewCourse({
        id: "",
        title: "",
        provider: "",
        date: "",
        description: "",
        type: "course",
        writingStyle: "bullet"
      });
      setIsAdding(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingId(course.id);
    setNewCourse(course);
  };

  const handleUpdateCourse = () => {
    const updatedCourses = courses.map(course =>
      course.id === editingId ? newCourse : course
    );
    setCourses(updatedCourses);
    onCoursesChange(updatedCourses);
    setEditingId(null);
    setNewCourse({
      id: "",
      title: "",
      provider: "",
      date: "",
      description: "",
      type: "course",
      writingStyle: "bullet"
    });
  };

  const handleDeleteCourse = (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);
    onCoursesChange(updatedCourses);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewCourse({
      id: "",
      title: "",
      provider: "",
      date: "",
      description: "",
      type: "course",
      writingStyle: "bullet"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses & Certifications <span className="text-sm font-normal text-muted-foreground">(optional)</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border rounded p-4 space-y-2">
            {editingId === course.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edit-title-${course.id}`}>Title</Label>
                    <Input
                      id={`edit-title-${course.id}`}
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      placeholder="Course or Certification Title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-provider-${course.id}`}>Provider</Label>
                    <Input
                      id={`edit-provider-${course.id}`}
                      value={newCourse.provider}
                      onChange={(e) => setNewCourse({...newCourse, provider: e.target.value})}
                      placeholder="Institution or Organization"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edit-date-${course.id}`}>Date</Label>
                    <Input
                      id={`edit-date-${course.id}`}
                      value={newCourse.date}
                      onChange={(e) => setNewCourse({...newCourse, date: e.target.value})}
                      placeholder="January 2023"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-type-${course.id}`}>Type</Label>
                    <Select
                      value={newCourse.type}
                      onValueChange={(value) => setNewCourse({...newCourse, type: value as "course" | "certification"})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="mb-2">
                    <WritingStyleSelector
                      value={newCourse.writingStyle || "bullet"}
                      onChange={(style) => setNewCourse({...newCourse, writingStyle: style})}
                      label="Writing Style"
                    />
                  </div>
                  
                  <Label htmlFor={`edit-description-${course.id}`}>Description</Label>
                  <Textarea
                    id={`edit-description-${course.id}`}
                    value={newCourse.description}
                    onChange={(e) => handleDescriptionChange(e.target.value, newCourse.writingStyle)}
                    placeholder={getPlaceholderText(newCourse.writingStyle)}
                    className="min-h-[100px]"
                    style={{
                      fontFamily: newCourse.writingStyle === "bullet" ? "monospace" : "inherit"
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateCourse} size="sm">
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
                    <h4 className="font-semibold">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.provider} | {course.date} | {course.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditCourse(course)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteCourse(course.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{course.description}</p>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="border rounded p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="Course or Certification Title"
                />
              </div>
              <div>
                <Label htmlFor="new-provider">Provider</Label>
                <Input
                  id="new-provider"
                  value={newCourse.provider}
                  onChange={(e) => setNewCourse({...newCourse, provider: e.target.value})}
                  placeholder="Institution or Organization"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-date">Date</Label>
                <Input
                  id="new-date"
                  value={newCourse.date}
                  onChange={(e) => setNewCourse({...newCourse, date: e.target.value})}
                  placeholder="January 2023"
                />
              </div>
              <div>
                <Label htmlFor="new-type">Type</Label>
                <Select
                  value={newCourse.type}
                  onValueChange={(value) => setNewCourse({...newCourse, type: value as "course" | "certification"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <WritingStyleSelector
                  value={newCourse.writingStyle || "bullet"}
                  onChange={(style) => setNewCourse({...newCourse, writingStyle: style})}
                  label="Writing Style"
                />
              </div>
              
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newCourse.description}
                onChange={(e) => handleDescriptionChange(e.target.value, newCourse.writingStyle)}
                placeholder={getPlaceholderText(newCourse.writingStyle)}
                className="min-h-[100px]"
                style={{
                  fontFamily: newCourse.writingStyle === "bullet" ? "monospace" : "inherit"
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddCourse} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Check className="w-4 h-4 mr-1" />
                Add Course/Certification
              </Button>
            </div>
          </div>
        )}

        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Course/Certification
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
