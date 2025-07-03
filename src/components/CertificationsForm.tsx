
import React, { useState } from 'react';
import { ResumeData, Certification } from '../types/ResumeTypes';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';

interface CertificationsFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  setActiveSection: (section: string) => void;
}

const CertificationsForm: React.FC<CertificationsFormProps> = ({
  resumeData,
  setResumeData,
  setActiveSection
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCertification, setNewCertification] = useState<Omit<Certification, 'id'>>({
    name: '',
    issuer: '',
    date: '',
    url: ''
  });

  const addCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      const certification: Certification = {
        ...newCertification,
        id: Date.now().toString()
      };

      setResumeData({
        ...resumeData,
        certifications: [...resumeData.certifications, certification]
      });

      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        url: ''
      });
    }
  };

  const updateCertification = (id: string, updatedCertification: Partial<Certification>) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.map(cert =>
        cert.id === id ? { ...cert, ...updatedCertification } : cert
      )
    });
  };

  const deleteCertification = (id: string) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter(cert => cert.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Certifications</h2>

      {/* Add New Certification */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Add New Certification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Certification Name"
            value={newCertification.name}
            onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Issuing Organization"
            value={newCertification.issuer}
            onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="text"
            placeholder="Date Obtained (e.g., Jan 2023)"
            value={newCertification.date}
            onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <input
            type="url"
            placeholder="Certificate URL (optional)"
            value={newCertification.url || ''}
            onChange={(e) => setNewCertification({ ...newCertification, url: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={addCertification}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Certification</span>
        </button>
      </div>

      {/* Certifications List */}
      <div className="space-y-4">
        {resumeData.certifications.map((certification) => (
          <div key={certification.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === certification.id ? (
              <EditCertificationForm
                certification={certification}
                onSave={(updated) => {
                  updateCertification(certification.id, updated);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{certification.name}</h4>
                    <p className="text-gray-600">{certification.issuer}</p>
                    <p className="text-sm text-gray-500">{certification.date}</p>
                    {certification.url && (
                      <a
                        href={certification.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        View Certificate →
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setEditingId(certification.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteCertification(certification.id)}
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
          onClick={() => setActiveSection('projects')}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Previous: Projects
        </button>
        <div className="text-sm text-gray-600 flex items-center">
          All sections completed! Use the export button to download your resume.
        </div>
      </div>
    </div>
  );
};

interface EditCertificationFormProps {
  certification: Certification;
  onSave: (updated: Partial<Certification>) => void;
  onCancel: () => void;
}

const EditCertificationForm: React.FC<EditCertificationFormProps> = ({
  certification,
  onSave,
  onCancel
}) => {
  const [editForm, setEditForm] = useState<Certification>(certification);

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Certification Name"
        />
        
        <input
          type="text"
          value={editForm.issuer}
          onChange={(e) => setEditForm({ ...editForm, issuer: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Issuing Organization"
        />
        
        <input
          type="text"
          value={editForm.date}
          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Date Obtained"
        />
        
        <input
          type="url"
          value={editForm.url || ''}
          onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Certificate URL (optional)"
        />
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

export default CertificationsForm;
