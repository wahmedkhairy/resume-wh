import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import WritingStyleSelector from "@/components/WritingStyleSelector";

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
  onProjectsChange: (projects: Project[]) => void;
  initialProjects: Project[];
}

const ProjectsBar: React.FC<ProjectsBarProps> = ({
  onProjectsChange,
  initialProjects = []
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    id: "",
    title: "",
    description: "",
    technologies: "",
    startDate: "",
    endDate: "",
    url: "",
    writingStyle: "bullet"
  });

  const handleAddProject = () => {
    if (newProject.title.trim()) {
      const projectWithId = {
        ...newProject,
        id: `project-${Date.now()}`
      };
      const updatedProjects = [...projects, projectWithId];
      setProjects(updatedProjects);
      onProjectsChange(updatedProjects);
      setNewProject({
        id: "",
        title: "",
        description: "",
        technologies: "",
        startDate: "",
        endDate: "",
        url: "",
        writingStyle: "bullet"
      });
      setIsAdding(false);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingId(project.id);
    setNewProject(project);
  };

  const handleUpdateProject = () => {
    const updatedProjects = projects.map(project =>
      project.id === editingId ? newProject : project
    );
    setProjects(updatedProjects);
    onProjectsChange(updatedProjects);
    setEditingId(null);
    setNewProject({
      id: "",
      title: "",
      description: "",
      technologies: "",
      startDate: "",
      endDate: "",
      url: "",
      writingStyle: "bullet"
    });
  };

  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    onProjectsChange(updatedProjects);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewProject({
      id: "",
      title: "",
      description: "",
      technologies: "",
      startDate: "",
      endDate: "",
      url: "",
      writingStyle: "bullet"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="border rounded p-4 space-y-2">
            {editingId === project.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`edit-title-${project.id}`}>Project Title</Label>
                    <Input
                      id={`edit-title-${project.id}`}
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      placeholder="Project Title"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-technologies-${project.id}`}>Technologies Used</Label>
                    <Input
                      id={`edit-technologies-${project.id}`}
                      value={newProject.technologies}
                      onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`edit-start-${project.id}`}>Start Date</Label>
                    <Input
                      id={`edit-start-${project.id}`}
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                      placeholder="January 2023"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-end-${project.id}`}>End Date</Label>
                    <Input
                      id={`edit-end-${project.id}`}
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                      placeholder="March 2023"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edit-url-${project.id}`}>Project URL (Optional)</Label>
                    <Input
                      id={`edit-url-${project.id}`}
                      value={newProject.url}
                      onChange={(e) => setNewProject({...newProject, url: e.target.value})}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`edit-description-${project.id}`}>Description</Label>
                  <Textarea
                    id={`edit-description-${project.id}`}
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe the project, your role, and key achievements..."
                    className="min-h-[100px]"
                  />
                </div>

                <WritingStyleSelector
                  value={newProject.writingStyle || "bullet"}
                  onChange={(style) => setNewProject({...newProject, writingStyle: style})}
                  label="Description Format"
                />

                <div className="flex gap-2">
                  <Button onClick={handleUpdateProject} size="sm">
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
                    <h4 className="font-semibold">{project.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.technologies} | {project.startDate} - {project.endDate}
                    </p>
                    {project.url && (
                      <p className="text-sm text-blue-600">{project.url}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditProject(project)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="border rounded p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-title">Project Title</Label>
                <Input
                  id="new-title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  placeholder="Project Title"
                />
              </div>
              <div>
                <Label htmlFor="new-technologies">Technologies Used</Label>
                <Input
                  id="new-technologies"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new-start">Start Date</Label>
                <Input
                  id="new-start"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                  placeholder="January 2023"
                />
              </div>
              <div>
                <Label htmlFor="new-end">End Date</Label>
                <Input
                  id="new-end"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                  placeholder="March 2023"
                />
              </div>
              <div>
                <Label htmlFor="new-url">Project URL (Optional)</Label>
                <Input
                  id="new-url"
                  value={newProject.url}
                  onChange={(e) => setNewProject({...newProject, url: e.target.value})}
                  placeholder="https://github.com/username/project"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Describe the project, your role, and key achievements..."
                className="min-h-[100px]"
              />
            </div>

            <WritingStyleSelector
              value={newProject.writingStyle || "bullet"}
              onChange={(style) => setNewProject({...newProject, writingStyle: style})}
              label="Description Format"
            />

            <div className="flex gap-2">
              <Button onClick={handleAddProject}>
                <Check className="w-4 h-4 mr-1" />
                Add Project
              </Button>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsBar;
