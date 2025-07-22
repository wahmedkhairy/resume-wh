
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
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

  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const formatBulletPoints = (text: string): string => {
    if (!text) return "";
    
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) return "";
      
      const cleanLine = trimmedLine.replace(/^[•\-\*]\s*/, '');
      
      if (cleanLine) {
        return `• ${cleanLine}`;
      }
      
      return "";
    });
    
    return formattedLines.join('\n');
  };

  const updateCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    onCoursesChange(updatedCourses);
  };

  const handleFieldChange = (id: string, field: keyof Course, value: string) => {
    const updatedCourses = courses.map(course => {
      if (course.id === id) {
        if (field === 'description' && course.writingStyle === 'bullet') {
          return { ...course, [field]: formatBulletPoints(value) };
        }
        return { ...course, [field]: value };
      }
      return course;
    });
    updateCourses(updatedCourses);
  };

  const handleWritingStyleChange = (id: string, style: "bullet" | "paragraph") => {
    const updatedCourses = courses.map(course => {
      if (course.id === id) {
        const updatedCourse = { ...course, writingStyle: style };
        if (style === 'bullet' && course.description) {
          updatedCourse.description = formatBulletPoints(course.description);
        }
        return updatedCourse;
      }
      return course;
    });
    updateCourses(updatedCourses);
  };

  const getPlaceholderText = (writingStyle: "bullet" | "paragraph" = "paragraph") => {
    if (writingStyle === "bullet") {
      return "• Describe what you learned and key skills gained\n• Add specific achievements or certifications earned\n• Include relevant technologies or methodologies covered";
    }
    return "Describe what you learned and key skills gained...";
  };

  const handleAddCourse = () => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: "",
      provider: "",
      date: "",
      description: "",
      type: "course",
      writingStyle: "bullet"
    };
    const updatedCourses = [...courses, newCourse];
    updateCourses(updatedCourses);
  };

  const handleDeleteCourse = (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    updateCourses(updatedCourses);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Courses & Certifications <span className="text-sm font-normal text-muted-foreground">(optional)</span></CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border rounded p-4 space-y-3">
            <div className="flex justify-end items-start mb-2">
              <Button
                onClick={() => handleDeleteCourse(course.id)}
                variant="outline"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`title-${course.id}`}>Title</Label>
                <Input
                  id={`title-${course.id}`}
                  value={course.title}
                  onChange={(e) => handleFieldChange(course.id, 'title', e.target.value)}
                  placeholder="Course or Certification Title"
                />
              </div>
              <div>
                <Label htmlFor={`provider-${course.id}`}>Provider</Label>
                <Input
                  id={`provider-${course.id}`}
                  value={course.provider}
                  onChange={(e) => handleFieldChange(course.id, 'provider', e.target.value)}
                  placeholder="Institution or Organization"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor={`date-${course.id}`}>Date</Label>
              <Input
                id={`date-${course.id}`}
                value={course.date}
                onChange={(e) => handleFieldChange(course.id, 'date', e.target.value)}
                placeholder="January 2023"
              />
            </div>

            <div>
              <div className="mb-2">
                <WritingStyleSelector
                  value={course.writingStyle || "bullet"}
                  onChange={(style) => handleWritingStyleChange(course.id, style)}
                  label="Writing Style"
                />
              </div>
              
              <Label htmlFor={`description-${course.id}`}>Description</Label>
              <Textarea
                id={`description-${course.id}`}
                value={course.description}
                onChange={(e) => handleFieldChange(course.id, 'description', e.target.value)}
                placeholder={getPlaceholderText(course.writingStyle)}
                className="min-h-[100px]"
                style={{
                  fontFamily: course.writingStyle === "bullet" ? "monospace" : "inherit"
                }}
              />
            </div>
          </div>
        ))}

        <Button 
          onClick={handleAddCourse} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course/Certification
        </Button>
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
