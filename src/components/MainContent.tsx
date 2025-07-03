import React from 'react';
import { ResumeData } from '../types/ResumeTypes';
import { User } from '@supabase/supabase-js';
import { useSubscription } from '../hooks/useSubscription';
import TailoredResumeGenerator from './TailoredResumeGenerator';
import SubscriptionStatus from './SubscriptionStatus';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';

interface MainContentProps {
  user: User | null;
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  onExport: () => void;
  isExporting: boolean;
}

const MainContent: React.FC<MainContentProps> = ({
  user,
  resumeData,
  setResumeData,
  activeSection,
  setActiveSection,
  onExport,
  isExporting
}) => {
  const { subscription, loading: subscriptionLoading } = useSubscription();

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
      case 'experience':
      case 'education':
      case 'skills':
      case 'projects':
      case 'certifications':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ResumeForm
                resumeData={resumeData}
                setResumeData={setResumeData}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onExport={onExport}
                isExporting={isExporting}
              />
            </div>
            <div>
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        );
      
      case 'targeted-resumes':
        return (
          <div className="space-y-6">
            <TailoredResumeGenerator
              user={user}
              resumeData={resumeData}
              subscription={subscription}
              subscriptionLoading={subscriptionLoading}
            />
          </div>
        );
      
      case 'subscription':
        return (
          <div className="space-y-6">
            <SubscriptionStatus
              subscription={subscription}
              loading={subscriptionLoading}
            />
          </div>
        );
      
      default:
        // Default to personal section if unknown section
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ResumeForm
                resumeData={resumeData}
                setResumeData={setResumeData}
                activeSection="personal"
                setActiveSection={setActiveSection}
                onExport={onExport}
                isExporting={isExporting}
              />
            </div>
            <div>
              <ResumePreview resumeData={resumeData} />
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {renderSectionContent()}
      </div>
    </main>
  );
};

export default MainContent;