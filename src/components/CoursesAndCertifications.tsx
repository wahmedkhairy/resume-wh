
import React, { useState, useEffect } from "react";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Award, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
}

interface CoursesAndCertificationsProps {
  initialCourses?: Course[];
  onCoursesChange?: (courses: Course[]) => void;
}

const CoursesAndCertifications: React.FC<CoursesAndCertificationsProps> = ({ 
  initialCourses = [], 
  onCoursesChange 
}) => {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const { toast } = useToast();

  // Initialize with at least one empty course if none exist
  useEffect(() => {
    if (courses.length === 0) {
      const defaultCourse: Course = {
        id: Date.now().toString(),
        title: "",
        provider: "",
        date: "",
        description: "",
        type: "course",
      };
      setCourses([defaultCourse]);
    }
  }, []);

  // When courses state changes, notify parent component
  useEffect(() => {
    if (onCoursesChange) {
      // Filter out completely empty courses before sending to parent
      const validCourses = courses.filter(course => 
        course.title.trim() || course.provider.trim() || course.date.trim() || course.description.trim()
      );
      onCoursesChange(validCourses);
    }
  }, [courses, onCoursesChange]);

  const updateCourse = (id: string, field: keyof Course, value: string | ("course" | "certification")) => {
    setCourses(prevCourses => 
      prevCourses.map(course => 
        course.id === id 
          ? { ...course, [field]: value }
          : course
      )
    );
  };

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      title: "",
      provider: "",
      date: "",
      description: "",
      type: "course",
    };
    setCourses([...courses, newCourse]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(course => course.id !== id));
    } else {
      toast({
        title: "Cannot Remove",
        description: "At least one course/certification entry is required.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Courses & Certifications</CardTitle>
        <CardDescription>
          Add relevant courses and certifications to enhance your resume. Changes are automatically reflected in the preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {courses.map((course, index) => (
          <div key={course.id} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {course.type === "certification" ? (
                  <Award className="h-5 w-5 text-blue-500" />
                ) : (
                  <BookOpen className="h-5 w-5 text-green-500" />
                )}
                <h3 className="font-semibold">
                  {course.type === "certification" ? "Certification" : "Course"} #{index + 1}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCourse(course.id)}
                disabled={courses.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <RadioGroup
                  value={course.type}
                  onValueChange={(value) => updateCourse(course.id, 'type', value as "course" | "certification")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="course" id={`course-${course.id}`} />
                    <Label htmlFor={`course-${course.id}`} className="cursor-pointer flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-green-500" /> Course
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="certification" id={`certification-${course.id}`} />
                    <Label htmlFor={`certification-${course.id}`} className="cursor-pointer flex items-center">
                      <Award className="h-4 w-4 mr-1 text-blue-500" /> Certification
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${course.id}`}>Title</Label>
                  <Input
                    id={`title-${course.id}`}
                    value={course.title}
                    onChange={(e) => updateCourse(course.id, 'title', e.target.value)}
                    placeholder="e.g., Advanced React Development"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`provider-${course.id}`}>Provider</Label>
                  <Input
                    id={`provider-${course.id}`}
                    value={course.provider}
                    onChange={(e) => updateCourse(course.id, 'provider', e.target.value)}
                    placeholder="e.g., Udemy, Coursera"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`date-${course.id}`}>Completion Date</Label>
                <Input
                  id={`date-${course.id}`}
                  value={course.date}
                  onChange={(e) => updateCourse(course.id, 'date', e.target.value)}
                  placeholder="e.g., May 2023"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${course.id}`}>Description (Optional)</Label>
                <Textarea
                  id={`description-${course.id}`}
                  value={course.description}
                  onChange={(e) => updateCourse(course.id, 'description', e.target.value)}
                  placeholder="Brief description of what you learned or achieved"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={addCourse} className="w-full" variant="outline">
          <Plus className="mr-1 h-4 w-4" /> Add Another Course/Certification
        </Button>
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
