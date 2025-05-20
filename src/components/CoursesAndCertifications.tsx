
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
  const [newTitle, setNewTitle] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"course" | "certification">("course");
  const { toast } = useToast();

  // When courses state changes, notify parent component
  useEffect(() => {
    if (onCoursesChange) {
      onCoursesChange(courses);
    }
  }, [courses, onCoursesChange]);

  const addCourse = () => {
    if (!newTitle.trim() || !newProvider.trim()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in at least the title and provider.",
        variant: "destructive",
      });
      return;
    }

    const course = {
      id: Date.now().toString(),
      title: newTitle,
      provider: newProvider,
      date: newDate,
      description: newDescription,
      type: newType,
    };

    setCourses([...courses, course]);
    setNewTitle("");
    setNewProvider("");
    setNewDate("");
    setNewDescription("");
    setNewType("course");
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((course) => course.id !== id));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Courses & Certifications</CardTitle>
        <CardDescription>
          Add relevant courses and certifications to enhance your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="p-4 border rounded-lg mb-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {course.type === "certification" ? (
                  <Award className="h-5 w-5 text-blue-500" />
                ) : (
                  <BookOpen className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.provider} {course.date && `- ${course.date}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCourse(course.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            {course.description && (
              <p className="text-sm mt-1">{course.description}</p>
            )}
          </div>
        ))}

        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Advanced React Development"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                placeholder="e.g., Udemy, Coursera"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Completion Date</Label>
            <Input
              id="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              placeholder="e.g., May 2023"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Brief description of what you learned or achieved"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <RadioGroup
              value={newType}
              onValueChange={(value) => setNewType(value as "course" | "certification")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="course" id="course" />
                <Label htmlFor="course" className="cursor-pointer flex items-center">
                  <BookOpen className="h-4 w-4 mr-1 text-green-500" /> Course
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="certification" id="certification" />
                <Label htmlFor="certification" className="cursor-pointer flex items-center">
                  <Award className="h-4 w-4 mr-1 text-blue-500" /> Certification
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button onClick={addCourse} className="w-full">
            <Plus className="mr-1 h-4 w-4" /> Add {newType === "certification" ? "Certification" : "Course"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
