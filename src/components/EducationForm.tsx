
import React, { useState } from 'react';
import { ResumeData, Education } from '../types/ResumeTypes';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface EducationFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  setActiveSection: (section: string) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({
  resumeData,
  setResumeData,
  setActiveSection
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
    degree: '',
    field: '',
    school: '',
    year: '',
    gpa: ''
  });

  const addEducation = () => {
    if (newEducation.degree && newEducation.school) {
      const education: Education = {
        ...newEducation,
        id: Date.now().toString()
      };

      setResumeData({
        ...resumeData,
        education: [...resumeData.education, education]
      });

      setNewEducation({
        degree: '',
        field: '',
        school: '',
        year: '',
        gpa: ''
      });
    }
  };

  const updateEducation = (id: string, updatedEducation: Partial<Education>) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, ...updatedEducation } : edu
      )
    });
  };

  const deleteEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Education</h2>

      {/* Add New Education */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Add New Education</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Degree (e.g., Bachelor of Science)"
            value={newEducation.degree}
            onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Field of Study"
            value={newEducation.field}
            onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="School/University"
            value={newEducation.school}
            onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Year (e.g., 2020)"
            value={newEducation.year}
            onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <input
          type="text"
          placeholder="GPA (optional)"
          value={newEducation.gpa || ''}
          onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
        
        <button
          onClick={addEducation}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Education</span>
        </button>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {resumeData.education.map((education) => (
          <div key={education.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === education.id ? (
              <EditEducationForm
                education={education}
                onSave={(updated) => {
                  updateEducation(education.id, updated);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{education.degree}</h4>
                    {education.field && <p className="text-gray-600">{education.field}</p>}
                    <p className="text-gray-600">{education.school}</p>
                    <p className="text-sm text-gray-500">
                      {education.year}
                      {education.gpa && ` • GPA: ${education.gpa}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(education.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteEducation(education.id)}
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
          onClick={() => setActiveSection('experience')}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous: Experience
        </button>
        <button
          onClick={() => setActiveSection('skills')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next: Skills
        </button>
      </div>
    </div>
  );
};

interface EditEducationFormProps {
  education: Education;
  onSave: (updated: Partial<Education>) => void;
  onCancel: () => void;
}

const EditEducationForm: React.FC<EditEducationFormProps> = ({
  education,
  onSave,
  onCancel
}) => {
  const [editForm, setEditForm] = useState<Education>(education);

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={editForm.degree}
          onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Degree"
        />
        
        <input
          type="text"
          value={editForm.field}
          onChange={(e) => setEditForm({ ...editForm, field: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Field of Study"
        />
        
        <input
          type="text"
          value={editForm.school}
          onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="School/University"
        />
        
        <input
          type="text"
          value={editForm.year}
          onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Year"
        />
      </div>
      
      <input
        type="text"
        value={editForm.gpa || ''}
        onChange={(e) => setEditForm({ ...editForm, gpa: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="GPA (optional)"
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

export default EducationForm;
