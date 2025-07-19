
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FolderOpen, Plus, X } from "lucide-react";
import WritingStyleSelector from "./WritingStyleSelector";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate: string;
  url?: string;
  writingStyle?: "bullet" | "paragraph";
}

interface ProjectsBarProps {
  onProjectsChange?: (projects: Project[]) => void;
  initialProjects?: Project[];
}

const ProjectsBar: React.FC<ProjectsBarProps> = ({ 
  onProjectsChange,
  initialProjects = []
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const addProject = () => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      title: "",
      description: "",
      technologies: "",
      startDate: "",
      endDate: "",
      url: "",
      writingStyle: "bullet"
    };
    
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    if (onProjectsChange) {
      onProjectsChange(updatedProjects);
    }
  };

  const removeProject = (id: string) => {
    const updatedProjects = projects.filter(proj => proj.id !== id);
    setProjects(updatedProjects);
    if (onProjectsChange) {
      onProjectsChange(updatedProjects);
    }
  };

  const updateProject = (id: string, field: keyof Project, value: string | "bullet" | "paragraph") => {
    const updatedProjects = projects.map(proj =>
      proj.id === id ? { ...proj, [field]: value } : proj
    );
    setProjects(updatedProjects);
    if (onProjectsChange) {
      onProjectsChange(updatedProjects);
    }
  };

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

  const handleDescriptionChange = (id: string, newValue: string, writingStyle: "bullet" | "paragraph") => {
    if (writingStyle === "bullet") {
      const formattedValue = formatBulletPoints(newValue);
      updateProject(id, "description", formattedValue);
    } else {
      updateProject(id, "description", newValue);
    }
  };

  const getPlaceholderText = (writingStyle: "bullet" | "paragraph") => {
    if (writingStyle === "bullet") {
      return "• Describe the main purpose and goals of the project\n• List key features and functionalities implemented\n• Highlight your specific contributions and achievements\n• Include metrics or results if applicable";
    }
    return "Provide a comprehensive description of the project, including its purpose, your role, key features implemented, technologies used, and the impact or results achieved.";
  };

  const getDescriptionValue = (description: string, writingStyle: "bullet" | "paragraph") => {
    return description;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Showcase your key projects and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProject(project.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor={`title-${project.id}`}>Project Title</Label>
                  <div className="relative">
                    <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id={`title-${project.id}`}
                      placeholder="E-commerce Platform"
                      className="pl-9"
                      value={project.title}
                      onChange={(e) => updateProject(project.id, "title", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`technologies-${project.id}`}>Technologies Used</Label>
                  <Input
                    id={`technologies-${project.id}`}
                    placeholder="React, Node.js, MongoDB"
                    value={project.technologies}
                    onChange={(e) => updateProject(project.id, "technologies", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${project.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${project.id}`}
                    placeholder="January 2023"
                    value={project.startDate}
                    onChange={(e) => updateProject(project.id, "startDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${project.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${project.id}`}
                    placeholder="March 2023"
                    value={project.endDate}
                    onChange={(e) => updateProject(project.id, "endDate", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`url-${project.id}`}>Project URL (Optional)</Label>
                  <Input
                    id={`url-${project.id}`}
                    placeholder="https://github.com/username/project"
                    value={project.url}
                    onChange={(e) => updateProject(project.id, "url", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <WritingStyleSelector
                  value={project.writingStyle || "bullet"}
                  onChange={(value) => updateProject(project.id, "writingStyle", value)}
                  className="mb-2"
                />
                <Textarea
                  placeholder={getPlaceholderText(project.writingStyle || "bullet")}
                  value={getDescriptionValue(project.description, project.writingStyle || "bullet")}
                  onChange={(e) => handleDescriptionChange(project.id, e.target.value, project.writingStyle || "bullet")}
                  className="min-h-[100px] font-mono text-sm"
                  style={{
                    fontFamily: project.writingStyle === "bullet" ? "monospace" : "inherit"
                  }}
                />
              </div>
            </div>
          ))}
          
          <Button
            variant="default"
            type="button"
            onClick={addProject}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsBar;
