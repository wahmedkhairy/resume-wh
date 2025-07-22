
import React, { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";

interface ATSScannerProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

interface ScanResults {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  structureScore: number;
  contentScore: number;
  suggestions: string[];
  strengths: string[];
  warnings: string[];
  isScanning: boolean;
}

const ATSScanner: React.FC<ATSScannerProps> = ({ resumeData }) => {
  const [scanResults, setScanResults] = useState<ScanResults>({
    overallScore: 0,
    formatScore: 0,
    keywordScore: 0,
    structureScore: 0,
    contentScore: 0,
    suggestions: [],
    strengths: [],
    warnings: [],
    isScanning: false
  });

  const [lastAnalyzedData, setLastAnalyzedData] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

  const performATSScan = useCallback(async (data: any) => {
    // Create a stable hash of the data to prevent unnecessary re-analysis
    const dataHash = JSON.stringify(data);
    if (dataHash === lastAnalyzedData) {
      return; // Skip if data hasn't changed
    }

    console.log('ATS Scanner: Starting analysis for new data');
    setScanResults(prev => ({ ...prev, isScanning: true }));
    
    try {
      // Simulate realistic scanning time
      await new Promise(resolve => setTimeout(resolve, 800));

      let formatScore = 100; // Perfect format since it's our template
      let keywordScore = 50; // Base score
      let structureScore = 0;
      let contentScore = 0;
      const suggestions: string[] = [];
      const strengths: string[] = [];
      const warnings: string[] = [];

      // Structure analysis
      let structurePoints = 0;
      if (data.personalInfo?.name && data.personalInfo?.email && data.personalInfo?.phone) {
        structurePoints += 25;
        strengths.push("Complete contact information provided");
      } else {
        suggestions.push("Add complete contact information (name, email, phone)");
      }

      if (data.summary && data.summary.length > 50) {
        structurePoints += 25;
        strengths.push("Professional summary included");
      } else {
        suggestions.push("Add a professional summary (150-300 words recommended)");
      }

      if (data.workExperience && data.workExperience.length > 0) {
        structurePoints += 25;
        strengths.push("Work experience section present");
      } else {
        suggestions.push("Add work experience details");
      }

      if (data.education && data.education.length > 0) {
        structurePoints += 25;
        strengths.push("Education information included");
      } else {
        suggestions.push("Add education details");
      }

      structureScore = structurePoints;

      // Content analysis
      let contentPoints = 0;
      const totalWords = [
        data.summary || '',
        ...(data.workExperience?.map((exp: any) => exp.responsibilities?.join(' ') || '') || [])
      ].join(' ').split(' ').filter(word => word.length > 0).length;

      if (totalWords > 100) {
        contentPoints += 25;
        strengths.push("Adequate content length");
      } else {
        suggestions.push("Add more detailed descriptions to your experience");
      }

      // Skills analysis
      if (data.skills && data.skills.length >= 5) {
        contentPoints += 25;
        keywordScore += 20;
        strengths.push("Good variety of skills listed");
      } else if (data.skills && data.skills.length > 0) {
        contentPoints += 15;
        keywordScore += 10;
        suggestions.push("Consider adding more relevant skills");
      } else {
        suggestions.push("Add technical and professional skills");
      }

      // Experience details
      if (data.workExperience?.some((exp: any) => exp.responsibilities && exp.responsibilities.length > 2)) {
        contentPoints += 25;
        keywordScore += 15;
        strengths.push("Detailed job responsibilities provided");
      } else {
        suggestions.push("Add more detailed job responsibilities and achievements");
      }

      // Quantifiable achievements
      const hasNumbers = [data.summary, ...(data.workExperience?.map((exp: any) => exp.responsibilities?.join(' ')) || [])]
        .join(' ')
        .match(/\d+%|\d+\+|\$\d+|\d+ years?|\d+ months?/gi);

      if (hasNumbers && hasNumbers.length > 0) {
        contentPoints += 25;
        keywordScore += 15;
        strengths.push("Quantifiable achievements included");
      } else {
        suggestions.push("Add quantifiable achievements with numbers and percentages");
      }

      contentScore = contentPoints;

      // Additional keyword analysis
      const commonKeywords = ['manage', 'lead', 'develop', 'implement', 'improve', 'increase', 'reduce', 'collaborate', 'analyze', 'optimize'];
      const contentText = [data.summary, ...(data.workExperience?.map((exp: any) => exp.responsibilities?.join(' ')) || [])].join(' ').toLowerCase();
      
      const foundKeywords = commonKeywords.filter(keyword => contentText.includes(keyword));
      keywordScore += foundKeywords.length * 2;

      if (keywordScore > 100) keywordScore = 100;

      // Warnings
      if (contentText.includes('responsible for')) {
        warnings.push("Avoid passive phrases like 'responsible for' - use action verbs instead");
      }

      if (data.summary && data.summary.length > 500) {
        warnings.push("Professional summary might be too long - keep it under 300 words");
      }

      if (!data.personalInfo?.jobTitle) {
        suggestions.push("Add a professional title/job position");
      }

      // Calculate overall score
      const overallScore = Math.round((formatScore + keywordScore + structureScore + contentScore) / 4);

      console.log('ATS Scanner: Analysis complete', {
        overallScore,
        formatScore,
        keywordScore,
        structureScore,
        contentScore
      });

      setScanResults({
        overallScore,
        formatScore,
        keywordScore,
        structureScore,
        contentScore,
        suggestions,
        strengths,
        warnings,
        isScanning: false
      });

      setLastAnalyzedData(dataHash);

    } catch (error) {
      console.error('ATS Scanner: Analysis error', error);
      setScanResults(prev => ({
        ...prev,
        isScanning: false,
        suggestions: ['Analysis failed. Please try again.'],
        warnings: ['There was an error analyzing your resume.']
      }));
    }
  }, [lastAnalyzedData]);

  // Handle initial load and data changes with proper debouncing
  useEffect(() => {
    if (!resumeData) return;

    // Check if user came from fix my resume
    const isFromFixMyResume = localStorage.getItem('atsAnalysisCompleted') === 'true';
    
    if (isFromFixMyResume && !hasInitialized) {
      console.log('ATS Scanner: User came from fix my resume, skipping initial scan');
      localStorage.removeItem('atsAnalysisCompleted');
      setHasInitialized(true);
      return;
    }

    if (!hasInitialized) {
      setHasInitialized(true);
      console.log('ATS Scanner: Initial scan starting');
      performATSScan(resumeData);
      return;
    }

    console.log('ATS Scanner: Data changed, scheduling scan');
    
    // Debounce subsequent scans with longer delay
    const timeoutId = setTimeout(() => {
      performATSScan(resumeData);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [resumeData, performATSScan, hasInitialized]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  if (scanResults.isScanning) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 animate-pulse">
            Scanning...
          </div>
          <p className="text-sm text-muted-foreground">Running comprehensive analysis</p>
          <Progress value={75} className="mt-2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${getScoreColor(scanResults.overallScore)}`}>
          {scanResults.overallScore}%
        </div>
        <p className="text-sm text-muted-foreground">Overall ATS Score</p>
        <Progress value={scanResults.overallScore} className="mt-2" />
      </div>

      {/* Detailed Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Format</span>
            <div className="flex items-center gap-1">
              {getScoreIcon(scanResults.formatScore)}
              <span className={`text-sm ${getScoreColor(scanResults.formatScore)}`}>
                {scanResults.formatScore}%
              </span>
            </div>
          </div>
          <Progress value={scanResults.formatScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Keywords</span>
            <div className="flex items-center gap-1">
              {getScoreIcon(scanResults.keywordScore)}
              <span className={`text-sm ${getScoreColor(scanResults.keywordScore)}`}>
                {scanResults.keywordScore}%
              </span>
            </div>
          </div>
          <Progress value={scanResults.keywordScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Structure</span>
            <div className="flex items-center gap-1">
              {getScoreIcon(scanResults.structureScore)}
              <span className={`text-sm ${getScoreColor(scanResults.structureScore)}`}>
                {scanResults.structureScore}%
              </span>
            </div>
          </div>
          <Progress value={scanResults.structureScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Content</span>
            <div className="flex items-center gap-1">
              {getScoreIcon(scanResults.contentScore)}
              <span className={`text-sm ${getScoreColor(scanResults.contentScore)}`}>
                {scanResults.contentScore}%
              </span>
            </div>
          </div>
          <Progress value={scanResults.contentScore} className="h-2" />
        </div>
      </div>

      {/* Strengths */}
      {scanResults.strengths.length > 0 && (
        <div>
          <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Strengths
          </h4>
          <div className="space-y-1">
            {scanResults.strengths.map((strength, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800 mr-2 mb-1">
                {strength}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {scanResults.warnings.length > 0 && (
        <div>
          <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Warnings
          </h4>
          <div className="space-y-1">
            {scanResults.warnings.map((warning, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 mr-2 mb-1">
                {warning}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {scanResults.suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
            <Zap className="h-4 w-4" />
            Suggestions for Improvement
          </h4>
          <div className="space-y-1">
            {scanResults.suggestions.map((suggestion, index) => (
              <Badge key={index} variant="outline" className="text-xs mr-2 mb-1">
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATSScanner;
