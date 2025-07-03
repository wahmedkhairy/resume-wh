import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Target, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { ResumeData } from '../types/ResumeTypes';

interface TailoredResumeGeneratorProps {
  user: User | null;
  resumeData: ResumeData;
  subscription: any;
  subscriptionLoading: boolean;
}

interface GeneratedResume {
  id: string;
  jobTitle: string;
  company: string;
  tailoredContent: ResumeData;
  createdAt: string;
}

const TailoredResumeGenerator: React.FC<TailoredResumeGeneratorProps> = ({
  user,
  resumeData,
  subscription,
  subscriptionLoading
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>([]);
  const [currentTailoredResume, setCurrentTailoredResume] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user can access targeted resumes
  const canAccessTargetedResumes = () => {
    if (!subscription || !user) return false;
    return ['basic', 'premium', 'unlimited'].includes(subscription.tier?.toLowerCase());
  };

  // Get remaining targeted resumes based on plan
  const getRemainingTargetedResumes = () => {
    if (!subscription) return 0;
    
    switch (subscription.tier?.toLowerCase()) {
      case 'basic':
        return 1;
      case 'premium':
        return 3;
      case 'unlimited':
        return 999;
      default:
        return 0;
    }
  };

  // Check if user can export
  const canExport = () => {
    return subscription && subscription.scan_count > 0;
  };

  // Generate tailored resume
  const generateTailoredResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (!canAccessTargetedResumes()) {
      setError('You need an active subscription to access targeted resumes');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate AI processing (replace with actual AI integration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract job title and company from job description (simplified)
      const jobTitle = extractJobTitle(jobDescription);
      const company = extractCompany(jobDescription);

      // Generate tailored resume data
      const tailoredResume: ResumeData = {
        ...resumeData,
        // Enhance summary for the specific job
        summary: generateTailoredSummary(resumeData.summary, jobDescription),
        // Prioritize relevant skills
        skills: prioritizeSkills(resumeData.skills, jobDescription),
        // Optimize experience descriptions
        workExperience: optimizeExperience(resumeData.workExperience, jobDescription),
      };

      const newResume: GeneratedResume = {
        id: Date.now().toString(),
        jobTitle,
        company,
        tailoredContent: tailoredResume,
        createdAt: new Date().toISOString(),
      };

      setGeneratedResumes(prev => [newResume, ...prev]);
      setCurrentTailoredResume(tailoredResume);
      setSuccess('Resume tailored successfully!');
      setJobDescription('');
      
    } catch (err) {
      setError('Failed to generate tailored resume. Please try again.');
      console.error('Error generating tailored resume:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export tailored resume
  const exportTailoredResume = async (resumeContent: ResumeData) => {
    if (!canExport()) {
      setError('You have no remaining exports. Please upgrade your plan.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      // Generate PDF (replace with actual PDF generation)
      const pdfBlob = await generatePDF(resumeContent);
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailored-resume-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update subscription scan count
      await updateScanCount();
      
      setSuccess('Resume exported successfully!');
      
    } catch (err) {
      setError('Failed to export resume. Please try again.');
      console.error('Error exporting resume:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Update scan count after export
  const updateScanCount = async () => {
    // This would typically be handled by the useSubscription hook
    // For now, we'll just simulate the update
    console.log('Updating scan count...');
  };

  // Helper functions (simplified implementations)
  const extractJobTitle = (description: string): string => {
    const titleMatch = description.match(/(?:job title|position|role):\s*([^\n]+)/i);
    return titleMatch ? titleMatch[1].trim() : 'Software Developer';
  };

  const extractCompany = (description: string): string => {
    const companyMatch = description.match(/(?:company|organization):\s*([^\n]+)/i);
    return companyMatch ? companyMatch[1].trim() : 'Company';
  };

  const generateTailoredSummary = (originalSummary: string, jobDescription: string): string => {
    // Simplified AI-like enhancement
    const keywords = extractKeywords(jobDescription);
    return `${originalSummary} Experienced with ${keywords.slice(0, 3).join(', ')}.`;
  };

  const extractKeywords = (text: string): string[] => {
    const common = ['react', 'javascript', 'typescript', 'node.js', 'python', 'aws', 'docker', 'kubernetes'];
    return common.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const prioritizeSkills = (skills: string[], jobDescription: string): string[] => {
    const keywords = extractKeywords(jobDescription);
    const prioritized = skills.filter(skill => 
      keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
    );
    const remaining = skills.filter(skill => !prioritized.includes(skill));
    return [...prioritized, ...remaining];
  };

  const optimizeExperience = (experience: any[], jobDescription: string): any[] => {
    // Simplified optimization - in reality this would use AI
    return experience.map(exp => ({
      ...exp,
      description: `${exp.description} (Relevant to: ${extractKeywords(jobDescription).slice(0, 2).join(', ')})`
    }));
  };

  const generatePDF = async (resumeContent: ResumeData): Promise<Blob> => {
    // Simplified PDF generation - replace with actual implementation
    const pdfContent = JSON.stringify(resumeContent, null, 2);
    return new Blob([pdfContent], { type: 'application/pdf' });
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (subscriptionLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!canAccessTargetedResumes()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="text-red-500" size={20} />
          <h2 className="text-xl font-bold text-gray-800">Targeted Resume Generator</h2>
        </div>
        <p className="text-gray-600 mb-4">
          You need an active subscription to access the targeted resume feature.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          Upgrade Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="text-blue-500" size={24} />
          <h2 className="text-2xl font-bold text-gray-800">Targeted Resume Generator</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Generate AI-tailored resumes for specific job descriptions to increase your chances of getting interviews.
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Remaining: {getRemainingTargetedResumes()}</span>
          <span>•</span>
          <span>Exports: {subscription?.scan_count || 0}</span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={16} />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={16} />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Job Description Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Job Description</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here. Include job title, company, requirements, and responsibilities..."
          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {jobDescription.length} characters
          </span>
          <button
            onClick={generateTailoredResume}
            disabled={isGenerating || !jobDescription.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Target size={16} />
            <span>{isGenerating ? 'Generating...' : 'Generate Tailored Resume'}</span>
          </button>
        </div>
      </div>

      {/* Current Tailored Resume Preview */}
      {currentTailoredResume && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Tailored Resume</h3>
            <button
              onClick={() => exportTailoredResume(currentTailoredResume)}
              disabled={isExporting || !canExport()}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Download size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Enhanced Summary:</h4>
            <p className="text-gray-600 text-sm mb-4">{currentTailoredResume.summary}</p>
            
            <h4 className="font-semibold text-gray-800 mb-2">Prioritized Skills:</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {currentTailoredResume.skills.slice(0, 8).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>
            
            <p className="text-sm text-gray-500">
              Resume optimized for better keyword matching and relevance.
            </p>
          </div>
        </div>
      )}

      {/* Generated Resumes History */}
      {generatedResumes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Resumes History</h3>
          <div className="space-y-3">
            {generatedResumes.map((resume) => (
              <div key={resume.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{resume.jobTitle}</h4>
                    <p className="text-sm text-gray-500">{resume.company}</p>
                    <p className="text-xs text-gray-400">
                      Generated on {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentTailoredResume(resume.tailoredContent)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => exportTailoredResume(resume.tailoredContent)}
                      disabled={isExporting || !canExport()}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <Download size={12} />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips for Better Results</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include the complete job description with requirements and responsibilities</li>
          <li>• Mention the company name and job title for better targeting</li>
          <li>• Ensure your base resume is complete before generating tailored versions</li>
          <li>• Review and customize the generated resume before exporting</li>
        </ul>
      </div>
    </div>
  );
};

export default TailoredResumeGenerator;