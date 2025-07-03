
import React, { useState } from 'react';
import { ResumeData } from '../types/ResumeTypes';
import { Plus, X } from 'lucide-react';

interface SkillsFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  setActiveSection: (section: string) => void;
}

const SkillsForm: React.FC<SkillsFormProps> = ({
  resumeData,
  setResumeData,
  setActiveSection
}) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>

      {/* Add New Skill */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Add Skills</h3>
        
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter a skill (e.g., JavaScript, Project Management)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addSkill}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
        
        <p className="text-sm text-gray-600">
          Press Enter or click Add to include the skill. Add both technical and soft skills.
        </p>
      </div>

      {/* Skills List */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Your Skills</h3>
        
        {resumeData.skills.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No skills added yet. Start by adding your first skill above.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2 group"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(skill)}
                  className="text-blue-600 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Categories Suggestions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Skill Categories to Consider:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            <strong>Technical Skills:</strong>
            <ul className="list-disc list-inside ml-2">
              <li>Programming Languages</li>
              <li>Software & Tools</li>
              <li>Frameworks & Libraries</li>
              <li>Databases</li>
            </ul>
          </div>
          <div>
            <strong>Soft Skills:</strong>
            <ul className="list-disc list-inside ml-2">
              <li>Communication</li>
              <li>Leadership</li>
              <li>Problem Solving</li>
              <li>Time Management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveSection('education')}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous: Education
        </button>
        <button
          onClick={() => setActiveSection('projects')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Next: Projects
        </button>
      </div>
    </div>
  );
};

export default SkillsForm;
