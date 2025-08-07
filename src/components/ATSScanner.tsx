
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, FileText, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
  const [skipInitialScan, setSkipInitialScan] = useState(false);

  // Check if user came from fix my resume and handle it properly
  useEffect(() => {
    const isFromFixMyResume = localStorage.getItem('atsAnalysisCompleted') === 'true';
    if (isFromFixMyResume) {
      console.log('ATS Scanner: User came from fix my resume, skipping initial scan only');
      setSkipInitialScan(true);
      // Clear the flag so it doesn't affect future sessions
      localStorage.removeItem('atsAnalysisCompleted');
    }
  }, []);

  const performATSScan = useCallback(async (data: any) => {
    // Create a stable hash of the data to prevent unnecessary re-analysis
    const dataHash = JSON.stringify(data);
    if (dataHash === lastAnalyzedData) {
      console.log('ATS Scanner: Skipping scan - data unchanged');
      return; // Skip if data hasn't changed
    }

    console.log('ATS Scanner: Starting AI-powered ATS scan');
    setScanResults(prev => ({ ...prev, isScanning: true }));
    
    try {
      // Call the new AI-powered ATS analysis
      const { data: analysis, error } = await supabase.functions.invoke('advanced-ats-analysis', {
        body: {
          resumeData: data,
          analysisType: 'resume-only'
        },
      });

      if (error) {
        throw new Error(error.message || 'Edge function error');
      }

      console.log('ATS Scanner: AI analysis complete', analysis);

      setScanResults({
        overallScore: analysis.overallScore,
        formatScore: analysis.formatScore,
        keywordScore: analysis.keywordScore,
        structureScore: analysis.structureScore,
        contentScore: analysis.contentScore,
        suggestions: analysis.suggestions || [],
        strengths: analysis.strengths || [],
        warnings: analysis.warnings || [],
        isScanning: false
      });

      setLastAnalyzedData(dataHash);

    } catch (error) {
      console.error('ATS Scanner: AI analysis error, falling back to basic analysis', error);
      
      // Fallback to basic rule-based analysis
      await performBasicATSScan(data);
      setLastAnalyzedData(dataHash);
    }
  }, [lastAnalyzedData]);

  const performBasicATSScan = async (data: any) => {
    let formatScore = 90; // Using our template layout
    let keywordScore = 30;
    let structureScore = 0;
    let contentScore = 25;
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const warnings: string[] = [];

    // Structure analysis (sections present)
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

    // Build text for content/keyword analysis
    const parts: string[] = [];
    if (data.summary) parts.push(data.summary);
    data.workExperience?.forEach((job: any) => {
      if (job.jobTitle) parts.push(job.jobTitle);
      if (job.company) parts.push(job.company);
      (job.responsibilities || []).forEach((r: string) => parts.push(r));
    });
    (data.skills || []).forEach((s: any) => s?.name && parts.push(s.name));
    const fullText = parts.join(' ').trim();

    // Gibberish/quality checks
    const cleaned = fullText.toLowerCase().replace(/[^a-z0-9%\s.\-]/g, ' ');
    const words = cleaned.split(/\s+/).filter(Boolean);
    const longNoVowel = words.filter(w => w.length >= 5 && !/[aeiou]/.test(w));
    const repeatedSeq = /(.)\1{3,}/i.test(cleaned);
    const nonsenseRate = words.length ? (longNoVowel.length / words.length) : 1;
    const tooShort = words.length < 80; // require some real content

    if (repeatedSeq || nonsenseRate > 0.3 || tooShort) {
      warnings.push("Detected low-quality or non-meaningful text. Replace placeholder or random letters with real sentences.");
      contentScore = Math.max(0, contentScore - 20);
      keywordScore = Math.max(0, keywordScore - 20);
      suggestions.push("Write clear, grammatical bullet points with real achievements.");
    }

    // Action verbs and quantification
    const actionVerbs = ['led','managed','built','created','implemented','designed','optimized','improved','launched','delivered','increased','reduced','developed','analyzed','collaborated','negotiated','trained','mentored','automated'];
    const hasActionVerb = actionVerbs.some(v => new RegExp(`\\b${v}\\b`, 'i').test(fullText));
    if (hasActionVerb) {
      keywordScore += 10;
      strengths.push("Good use of action verbs");
    } else {
      suggestions.push("Start bullets with strong action verbs (e.g., Led, Implemented, Built)");
    }

    const hasMetrics = /(\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d+%\b)/.test(fullText);
    if (hasMetrics) {
      contentScore += 10;
      strengths.push("Includes quantified achievements");
    } else {
      suggestions.push("Add metrics (%,$, time saved, growth) to quantify impact");
    }

    // General ATS keyword groups (broad, role-agnostic)
    const generalKeywords = ['project management','stakeholder','kpi','metrics','analysis','strategy','communication','leadership','collaboration','budget','process improvement','crm','sql','excel','reporting','presentation','problem solving','agile','api','cloud','automation','compliance','risk','roadmap'];
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matched = generalKeywords.filter(k => new RegExp(`\\b${escape(k)}\\b`, 'i').test(fullText));
    keywordScore += Math.min(30, matched.length * 3);

    // Keyword stuffing penalty
    const overuse = generalKeywords.some(k => (fullText.match(new RegExp(`\\b${escape(k)}\\b`, 'gi')) || []).length > 10);
    if (overuse) {
      keywordScore = Math.max(0, keywordScore - 10);
      warnings.push('Detected keyword stuffing; keep wording natural.');
    }

    // Clamp scores
    formatScore = Math.min(100, Math.max(0, formatScore));
    keywordScore = Math.min(100, Math.max(0, keywordScore));
    contentScore = Math.min(100, Math.max(0, contentScore));

    const overallScore = Math.round((formatScore + keywordScore + structureScore + contentScore) / 4);

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
  };

  // Perform scan when data changes, but skip initial scan if user came from fix my resume
  useEffect(() => {
    if (!resumeData) return;

    // Skip the very first scan if user came from fix my resume
    if (skipInitialScan) {
      console.log('ATS Scanner: Skipping initial scan for fix my resume user');
      setSkipInitialScan(false); // Reset so future changes will trigger scans
      return;
    }

    console.log('ATS Scanner: Data changed, preparing to scan:', resumeData);

    // Longer debounce to prevent excessive calls during data loading
    const timeoutId = setTimeout(() => {
      performATSScan(resumeData);
    }, 2000); // Increased from 1000 to 2000ms

    return () => clearTimeout(timeoutId);
  }, [resumeData, performATSScan, skipInitialScan]);

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ATS Compatibility Scanner
          </CardTitle>
          <CardDescription>
            Analyzing your resume's ATS compatibility...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 animate-pulse">
              Scanning...
            </div>
            <p className="text-sm text-muted-foreground">Running comprehensive analysis</p>
            <Progress value={75} className="mt-2 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          ATS Compatibility Scanner
        </CardTitle>
        <CardDescription>
          Real-time analysis of your resume's ATS compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};

export default ATSScanner;
