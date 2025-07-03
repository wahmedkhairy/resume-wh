
import React, { useState } from 'react';
import { ResumeData, Project } from '../types/ResumeTypes';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface ProjectsFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  setActiveSection: (section: string) => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({
  resumeData,
  setResumeData,
  setActiveSection
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    technologies: [],
    url: ''
  });
  const [techInput, setTechInput] = useState('');

  const addTechnology = () => {
    if (techInput.trim() && !newProject.technologies.includes(techInput.trim())) {
      setNewProject({
        ...newProject,
        technologies: [...newProject.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setNewProject({
      ...newProject,
      technologies: newProject.technologies.filter(t => t !== tech)
    });
  };

  const addProject = () => {
    if (newProject.name && newProject.description) {
      const project: Project = {
        ...newProject,
        id: Date.now().toString()
      };

      setResumeData({
        ...resumeData,
        projects: [...resumeData.projects, project]
      });

      setNewProject({
        name: '',
        description: '',
        technologies: [],
        url: ''
      });
    }
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.map(proj =>
        proj.id === id ? { ...proj, ...updatedProject } : proj
      )
    });
  };

  const deleteProject = (id: string) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter(proj => proj.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Projects</h2>

      {/* Add New Project */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Add New Project</h3>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <textarea
            placeholder="Project description, your role, and key achievements..."
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="url"
            placeholder="Project URL (optional)"
            value={newProject.url || ''}
            onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Technologies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                placeholder="Add technology (e.g., React, Python)"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addTechnology}
                type="button"
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            {newProject.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {newProject.technologies.map((tech, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center space-x-1 text-sm"
                  >
                    <span>{tech}</span>
                    <button
                      onClick={() => removeTechnology(tech)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={addProject}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {resumeData.projects.map((project) => (
          <div key={project.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === project.id ? (
              <EditProjectForm
                project={project}
                onSave={(updated) => {
                  updateProject(project.id, updated);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{project.name}</h4>
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        View Project →
                      </a>
                    )}
                    <p className="text-gray-700 mt-2">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setEditingId(project.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveSection('skills')}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous: Skills
        </button>
        <button
          onClick={() => setActiveSection('certifications')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next: Certifications
        </button>
      </div>
    </div>
  );
};

interface EditProjectFormProps {
  project: Project;
  onSave: (updated: Partial<Project>) => void;
  onCancel: () => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({
  project,
  onSave,
  onCancel
}) => {
  const [editForm, setEditForm] = useState<Project>(project);
  const [techInput, setTechInput] = useState('');

  const addTechnology = () => {
    if (techInput.trim() && !editForm.technologies.includes(techInput.trim())) {
      setEditForm({
        ...editForm,
        technologies: [...editForm.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setEditForm({
      ...editForm,
      technologies: editForm.technologies.filter(t => t !== tech)
    });
  };

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={editForm.name}
        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Project Name"
      />
      
      <textarea
        value={editForm.description}
        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Project description..."
      />
      
      <input
        type="url"
        value={editForm.url || ''}
        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Project URL (optional)"
      />
      
      {/* Technologies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            placeholder="Add technology"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addTechnology}
            type="button"
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
        
        {editForm.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {editForm.technologies.map((tech, index) => (
              <div
                key={index}
                className="bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center space-x-1 text-sm"
              >
                <span>{tech}</span>
                <button
                  onClick={() => removeTechnology(tech)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save</span>
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <X size={16} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectsForm;
