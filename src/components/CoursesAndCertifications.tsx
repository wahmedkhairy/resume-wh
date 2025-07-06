
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Award, Plus, Trash2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
  descriptionFormat?: 'bullets' | 'paragraph';
}

interface CoursesAndCertificationsProps {
  onCoursesChange?: (courses: Course[]) => void;
  initialCourses?: Course[];
}

const CoursesAndCertifications: React.FC<CoursesAndCertificationsProps> = ({ 
  onCoursesChange,
  initialCourses = []
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  const addCourse = () => {
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: "",
      provider: "",
      date: "",
      description: "",
      type: "course",
      descriptionFormat: 'paragraph'
    };
    
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    if (onCoursesChange) {
      onCoursesChange(updatedCourses);
    }
  };

  const removeCourse = (id: string) => {
    const updatedCourses = courses.filter(course => course.id !== id);
    setCourses(updatedCourses);
    if (onCoursesChange) {
      onCoursesChange(updatedCourses);
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    const updatedCourses = courses.map(course =>
      course.id === id ? { ...course, [field]: value } : course
    );
    setCourses(updatedCourses);
    if (onCoursesChange) {
      onCoursesChange(updatedCourses);
    }
  };

  const updateDescriptionFormat = (courseId: string, format: 'bullets' | 'paragraph', event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const updatedCourses = courses.map(course => {
      if (course.id === courseId) {
        return { 
          ...course, 
          descriptionFormat: format
        };
      }
      return course;
    });
    
    setCourses(updatedCourses);
    if (onCoursesChange) {
      onCoursesChange(updatedCourses);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Courses & Certifications</CardTitle>
        <CardDescription>Add relevant courses and certifications to enhance your resume. Changes are automatically reflected in the preview.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {courses.map((course, index) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 relative">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-green-600 flex items-center gap-2">
                  📚 Course #{index + 1}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCourse(course.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <RadioGroup
                    value={course.type}
                    onValueChange={(value: "course" | "certification") => 
                      updateCourse(course.id, "type", value)
                    }
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="course" id={`course-${course.id}`} />
                      <Label htmlFor={`course-${course.id}`} className="flex items-center gap-1">
                        📚 Course
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="certification" id={`cert-${course.id}`} />
                      <Label htmlFor={`cert-${course.id}`} className="flex items-center gap-1">
                        🏆 Certification
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${course.id}`}>Title</Label>
                    <Input
                      id={`title-${course.id}`}
                      placeholder="e.g., Advanced React Development"
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`provider-${course.id}`}>Provider</Label>
                    <Input
                      id={`provider-${course.id}`}
                      placeholder="e.g., Udemy, Coursera"
                      value={course.provider}
                      onChange={(e) => updateCourse(course.id, "provider", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`date-${course.id}`}>Completion Date</Label>
                  <Input
                    id={`date-${course.id}`}
                    placeholder="e.g., May 2023"
                    value={course.date}
                    onChange={(e) => updateCourse(course.id, "date", e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor={`description-${course.id}`}>Description (Optional)</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={course.descriptionFormat === 'paragraph' ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => updateDescriptionFormat(course.id, 'paragraph', e)}
                      >
                        Paragraph
                      </Button>
                      <Button
                        type="button"
                        variant={course.descriptionFormat === 'bullets' ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => updateDescriptionFormat(course.id, 'bullets', e)}
                      >
                        Bullet Points
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    id={`description-${course.id}`}
                    placeholder="Brief description of what you learned or achieved"
                    value={course.description}
                    onChange={(e) => updateCourse(course.id, "description", e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addCourse}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Course/Certification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
