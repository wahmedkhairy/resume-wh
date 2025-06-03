
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, FileText, Users, Target, Zap } from "lucide-react";

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

const ATSScanner: React.FC<ATSScannerProps> = ({ resumeData }) => {
  const [scanResults, setScanResults] = useState({
    overallScore: 0,
    formatScore: 0,
    keywordScore: 0,
    structureScore: 0,
    contentScore: 0,
    suggestions: [] as string[],
    strengths: [] as string[],
    warnings: [] as string[]
  });

  useEffect(() => {
    if (resumeData) {
      performATSScan(resumeData);
    }
  }, [resumeData]);

  const performATSScan = (data: any) => {
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

    setScanResults({
      overallScore,
      formatScore,
      keywordScore,
      structureScore,
      contentScore,
      suggestions,
      strengths,
      warnings
    });
  };

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
                <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
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
                <Badge key={index} variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
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
                <Badge key={index} variant="outline" className="text-xs">
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
