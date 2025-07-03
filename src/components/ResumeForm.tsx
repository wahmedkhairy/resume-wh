
import React from 'react';
import { ResumeData } from '../types/ResumeTypes';
import PersonalInfoForm from './PersonalInfoForm';
import WorkExperienceForm from './WorkExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
import ProjectsForm from './ProjectsForm';
import CertificationsForm from './CertificationsForm';
import { Download } from 'lucide-react';

interface ResumeFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onExport: () => void;
  isExporting: boolean;
}

const ResumeForm: React.FC<ResumeFormProps> = ({
  resumeData,
  setResumeData,
  activeSection,
  setActiveSection,
  onExport,
  isExporting
}) => {
  const renderActiveSection = () => {
    const commonProps = {
      resumeData,
      setResumeData,
      setActiveSection
    };

    switch (activeSection) {
      case 'personal':
        return <PersonalInfoForm {...commonProps} />;
      case 'experience':
        return <WorkExperienceForm {...commonProps} />;
      case 'education':
        return <EducationForm {...commonProps} />;
      case 'skills':
        return <SkillsForm {...commonProps} />;
      case 'projects':
        return <ProjectsForm {...commonProps} />;
      case 'certifications':
        return <CertificationsForm {...commonProps} />;
      default:
        return <PersonalInfoForm {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          <Download size={20} />
          <span>{isExporting ? 'Exporting...' : 'Export Resume as PDF'}</span>
        </button>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default ResumeForm;
