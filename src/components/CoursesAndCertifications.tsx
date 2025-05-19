
import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Book, Award, Plus, Trash2, Wand2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
}

// Basic enhancement function as fallback
const enhanceCourseDescription = (course: Course): Course => {
  if (!course.description.trim()) {
    if (course.type === "certification") {
      return {
        ...course,
        description: `Professional certification validating expertise in ${course.title} from ${course.provider}.`
      };
    } else {
      return {
        ...course,
        description: `Comprehensive course covering key concepts and practical applications of ${course.title}.`
      };
    }
  }
  
  // If there's a description but it's very short, enhance it
  if (course.description.length < 30) {
    if (course.type === "certification") {
      return {
        ...course,
        description: `${course.description} This credential demonstrates professional competence in key industry standards and best practices.`
      };
    } else {
      return {
        ...course,
        description: `${course.description} The course provided hands-on experience and practical knowledge applicable to real-world scenarios.`
      };
    }
  }
  
  return course;
};

const CoursesAndCertifications = () => {
  const [items, setItems] = useState<Course[]>([
    {
      id: "1",
      title: "Advanced React Development",
      provider: "Frontend Masters",
      date: "2024",
      description: "Covered advanced React patterns, hooks, and performance optimization",
      type: "course",
    },
    {
      id: "2",
      title: "AWS Certified Solutions Architect",
      provider: "Amazon Web Services",
      date: "2023",
      description: "Professional certification for designing distributed systems on AWS",
      type: "certification",
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [currentItem, setCurrentItem] = useState<Course>({
    id: "",
    title: "",
    provider: "",
    date: "",
    description: "",
    type: "course",
  });
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setCurrentItem({
      id: "",
      title: "",
      provider: "",
      date: "",
      description: "",
      type: "course",
    });
    setShowForm(false);
  };

  const handleAddItem = () => {
    if (!currentItem.title || !currentItem.provider) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the title and provider.",
        variant: "destructive",
      });
      return;
    }

    if (currentItem.id) {
      // Edit existing item
      setItems(
        items.map((item) =>
          item.id === currentItem.id ? { ...currentItem } : item
        )
      );
      toast({
        title: "Item Updated",
        description: `Your ${currentItem.type} has been updated.`,
        variant: "default",
      });
    } else {
      // Add new item
      const newItem = {
        ...currentItem,
        id: Date.now().toString(),
      };
      setItems([...items, newItem]);
      toast({
        title: "Item Added",
        description: `Your ${currentItem.type} has been added.`,
        variant: "default",
      });
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const itemToEdit = items.find((item) => item.id === id);
    if (itemToEdit) {
      setCurrentItem({ ...itemToEdit });
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast({
      title: "Item Deleted",
      description: "Item has been removed from your resume.",
      variant: "default",
    });
  };

  const handleAIPolish = async () => {
    if (items.length === 0) {
      toast({
        title: "No Items to Polish",
        description: "Please add at least one course or certification first.",
        variant: "destructive",
      });
      return;
    }

    setIsPolishing(true);

    try {
      try {
        // Try calling the API first
        const itemsForPolishing = items.map(item => ({
          ...item,
          description: item.description || `${item.title} from ${item.provider}`
        }));
        
        const response = await fetch('/api/enhance-courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: JSON.stringify(itemsForPolishing) }),
        });
        
        if (!response.ok) {
          throw new Error('API unavailable');
        }
        
        const data = await response.json();
        
        if (data?.polishedItems) {
          setItems(data.polishedItems);
          toast({
            title: "Content Enhanced",
            description: "Your courses and certifications have been improved with AI.",
            variant: "default",
          });
          return;
        }
        
        throw new Error('Invalid API response');
      } catch (apiError) {
        console.log('API error, using fallback:', apiError);
        
        // Use fallback enhancement if API fails
        const enhancedItems = items.map(item => enhanceCourseDescription(item));
        setItems(enhancedItems);
        
        toast({
          title: "Descriptions Enhanced",
          description: "Your descriptions have been improved using local processing.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing your content.",
        variant: "destructive",
      });
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Courses & Certifications</CardTitle>
        <CardDescription>
          Add relevant courses and certifications to strengthen your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="p-4 border rounded-md">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                {item.type === "certification" ? (
                  <Award className="h-5 w-5 text-resume-success mt-1" />
                ) : (
                  <Book className="h-5 w-5 text-primary mt-1" />
                )}
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.provider} • {item.date}
                  </p>
                  {item.description && (
                    <p className="text-sm mt-1">{item.description}</p>
                  )}
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {showForm ? (
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={currentItem.type === "course" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentItem({ ...currentItem, type: "course" })}
              >
                <Book className="mr-1 h-4 w-4" /> Course
              </Button>
              <Button
                variant={currentItem.type === "certification" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentItem({ ...currentItem, type: "certification" })}
              >
                <Award className="mr-1 h-4 w-4" /> Certification
              </Button>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={currentItem.title}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              />
              <Input
                placeholder="Provider or Issuing Organization"
                value={currentItem.provider}
                onChange={(e) => setCurrentItem({ ...currentItem, provider: e.target.value })}
              />
              <Input
                placeholder="Year or Date Range"
                value={currentItem.date}
                onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
              />
              <Textarea
                placeholder="Description or key topics covered (optional)"
                value={currentItem.description}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              />
              <div className="flex space-x-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>
                  {currentItem.id ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIPolish}
              disabled={isPolishing}
            >
              <Wand2 className="mr-1 h-4 w-4" />
              {isPolishing ? "Enhancing..." : "Enhance Descriptions"}
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursesAndCertifications;
