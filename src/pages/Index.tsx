
import React, { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { ResumeData } from '../types/ResumeTypes';
import { useSubscription } from '../hooks/useSubscription';
import Navigation from '../components/Navigation';
import MainContent from '../components/MainContent';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthModal from '../components/AuthModal';

const Index: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    workExperience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  const [activeSection, setActiveSection] = useState('personal');
  const [isExporting, setIsExporting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const user = useUser();
  const supabase = useSupabaseClient();
  const { subscription, loading: subscriptionLoading, canExport, decrementExports } = useSubscription();

  // Load user's resume data on mount
  useEffect(() => {
    if (user) {
      loadUserResumeData();
    }
  }, [user]);

  // Auto-save resume data when it changes
  useEffect(() => {
    if (user && resumeData.personalInfo.fullName) {
      saveResumeData();
    }
  }, [resumeData, user]);

  const loadUserResumeData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error loading resume data:', error);
        }
        return;
      }

      if (data && data.resume_data) {
        setResumeData(data.resume_data);
      }
    } catch (err) {
      console.error('Error loading resume data:', err);
    }
  };

  const saveResumeData = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          resume_data: resumeData,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving resume data:', error);
      }
    } catch (err) {
      console.error('Error saving resume data:', err);
    }
  };

  const handleExport = async () => {
    if (!user) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }

    if (!canExport) {
      alert('You have no remaining exports. Please upgrade your plan.');
      return;
    }

    setIsExporting(true);

    try {
      // Generate PDF (replace with actual PDF generation library)
      const pdfBlob = await generatePDF(resumeData);
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${resumeData.personalInfo.fullName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Decrement the export count
      await decrementExports();

      alert('Resume exported successfully!');
    } catch (error) {
      console.error('Error exporting resume:', error);
      alert('Failed to export resume. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDF = async (data: ResumeData): Promise<Blob> => {
    // Simplified PDF generation - replace with actual implementation
    // You would typically use a library like jsPDF or Puppeteer
    const htmlContent = generateHTMLResume(data);
    return new Blob([htmlContent], { type: 'text/html' });
  };

  const generateHTMLResume = (data: ResumeData): string => {
    // Simplified HTML generation - replace with actual template
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.personalInfo.fullName} - Resume</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #333; border-bottom: 2px solid #333; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.personalInfo.fullName}</h1>
          <p>${data.personalInfo.email} | ${data.personalInfo.phone}</p>
          <p>${data.personalInfo.address}</p>
        </div>
        
        <div class="section">
          <h2>Summary</h2>
          <p>${data.summary}</p>
        </div>
        
        <div class="section">
          <h2>Skills</h2>
          <p>${data.skills.join(', ')}</p>
        </div>
        
        <div class="section">
          <h2>Experience</h2>
          ${data.workExperience.map(exp => `
            <div>
              <h3>${exp.jobTitle} at ${exp.company}</h3>
              <p><strong>${exp.startDate} - ${exp.endDate}</strong></p>
              <p>${exp.description}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>Education</h2>
          ${data.education.map(edu => `
            <div>
              <h3>${edu.degree} in ${edu.field}</h3>
              <p><strong>${edu.school} (${edu.year})</strong></p>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setResumeData({
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          linkedin: '',
          github: ''
        },
        summary: '',
        workExperience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
      });
      setActiveSection('personal');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (subscriptionLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Navigation
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          user={user}
          subscription={subscription}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {getSectionTitle(activeSection)}
                </h1>
                {user && (
                  <p className="text-sm text-gray-600">
                    Welcome back, {user.email}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {subscription ? (
                          <>
                            {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan
                            <span className="text-gray-400 ml-2">
                              {subscription.scan_count} exports left
                            </span>
                          </>
                        ) : (
                          'No active subscription'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setAuthMode('login');
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </header>

          <MainContent
            user={user}
            resumeData={resumeData}
            setResumeData={setResumeData}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
        />
      )}
    </div>
  );
};

const getSectionTitle = (section: string): string => {
  switch (section) {
    case 'personal':
      return 'Personal Information';
    case 'experience':
      return 'Work Experience';
    case 'education':
      return 'Education';
    case 'skills':
      return 'Skills';
    case 'projects':
      return 'Projects';
    case 'certifications':
      return 'Certifications';
    case 'targeted-resumes':
      return 'Targeted Job Resume';
    case 'subscription':
      return 'Subscription Status';
    default:
      return 'Resume Builder';
  }
};

export default Index;