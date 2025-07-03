
import React, { useState } from 'react';
import { ResumeData, WorkExperience } from '../types/ResumeTypes';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface WorkExperienceFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  setActiveSection: (section: string) => void;
}

const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({
  resumeData,
  setResumeData,
  setActiveSection
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExperience, setNewExperience] = useState<Omit<WorkExperience, 'id'>>({
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });

  const addExperience = () => {
    if (newExperience.jobTitle && newExperience.company) {
      const experience: WorkExperience = {
        ...newExperience,
        id: Date.now().toString()
      };

      setResumeData({
        ...resumeData,
        workExperience: [...resumeData.workExperience, experience]
      });

      setNewExperience({
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        location: '',
        description: ''
      });
    }
  };

  const updateExperience = (id: string, updatedExperience: Partial<WorkExperience>) => {
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.map(exp =>
        exp.id === id ? { ...exp, ...updatedExperience } : exp
      )
    });
  };

  const deleteExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      workExperience: resumeData.workExperience.filter(exp => exp.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Work Experience</h2>

      {/* Add New Experience */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Add New Experience</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Job Title"
            value={newExperience.jobTitle}
            onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Company"
            value={newExperience.company}
            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Start Date (e.g., Jan 2020)"
            value={newExperience.startDate}
            onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="End Date (e.g., Present)"
            value={newExperience.endDate}
            onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <input
          type="text"
          placeholder="Location"
          value={newExperience.location}
          onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        
        <textarea
          placeholder="Job description and achievements..."
          value={newExperience.description}
          onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        
        <button
          onClick={addExperience}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {resumeData.workExperience.map((experience) => (
          <div key={experience.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === experience.id ? (
              <EditExperienceForm
                experience={experience}
                onSave={(updated) => {
                  updateExperience(experience.id, updated);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{experience.jobTitle}</h4>
                    <p className="text-gray-600">{experience.company}</p>
                    <p className="text-sm text-gray-500">
                      {experience.startDate} - {experience.endDate}
                      {experience.location && ` • ${experience.location}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(experience.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteExperience(experience.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {experience.description && (
                  <p className="text-gray-700 mt-2">{experience.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveSection('personal')}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous: Personal Info
        </button>
        <button
          onClick={() => setActiveSection('education')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next: Education
        </button>
      </div>
    </div>
  );
};

interface EditExperienceFormProps {
  experience: WorkExperience;
  onSave: (updated: Partial<WorkExperience>) => void;
  onCancel: () => void;
}

const EditExperienceForm: React.FC<EditExperienceFormProps> = ({
  experience,
  onSave,
  onCancel
}) => {
  const [editForm, setEditForm] = useState<WorkExperience>(experience);

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={editForm.jobTitle}
          onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Job Title"
        />
        
        <input
          type="text"
          value={editForm.company}
          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Company"
        />
        
        <input
          type="text"
          value={editForm.startDate}
          onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Start Date"
        />
        
        <input
          type="text"
          value={editForm.endDate}
          onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="End Date"
        />
      </div>
      
      <input
        type="text"
        value={editForm.location}
        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Location"
      />
      
      <textarea
        value={editForm.description}
        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Job description and achievements..."
      />
      
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

export default WorkExperienceForm;
