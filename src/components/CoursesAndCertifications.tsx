
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Plus, Trash2, List, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  const updateDescriptionFormat = (courseId: string, format: 'bullets' | 'paragraph') => {
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
        <CardDescription>Add your professional courses and certifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg p-4 relative">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeCourse(course.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${course.id}`}>Title</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id={`title-${course.id}`}
                      placeholder="Course/Certification Title"
                      className="pl-9"
                      value={course.title}
                      onChange={(e) => updateCourse(course.id, "title", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`provider-${course.id}`}>Provider</Label>
                  <Input
                    id={`provider-${course.id}`}
                    placeholder="Institution/Organization"
                    value={course.provider}
                    onChange={(e) => updateCourse(course.id, "provider", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`date-${course.id}`}>Date</Label>
                  <Input
                    id={`date-${course.id}`}
                    placeholder="Month Year"
                    value={course.date}
                    onChange={(e) => updateCourse(course.id, "date", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`type-${course.id}`}>Type</Label>
                  <Select
                    value={course.type}
                    onValueChange={(value: "course" | "certification") => 
                      updateCourse(course.id, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="certification">Certification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`description-${course.id}`}>Description</Label>
                  <Select
                    value={course.descriptionFormat || 'paragraph'}
                    onValueChange={(value: 'bullets' | 'paragraph') => 
                      updateDescriptionFormat(course.id, value)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paragraph">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Paragraph
                        </div>
                      </SelectItem>
                      <SelectItem value="bullets">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Bullet Points
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Textarea
                  id={`description-${course.id}`}
                  placeholder={course.descriptionFormat === 'bullets' 
                    ? "• Key topic 1\n• Key topic 2\n• Key topic 3" 
                    : "Brief description of what you learned or achieved..."
                  }
                  value={course.description}
                  onChange={(e) => updateCourse(course.id, "description", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={addCourse}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Course/Certification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
