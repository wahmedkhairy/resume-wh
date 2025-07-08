
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertTriangle, XCircle, Target, FileText, Zap, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewATSAnalysisProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

interface AnalysisResult {
  overallScore: number;
  keywordMatch: number;
  structureScore: number;
  readabilityScore: number;
  suggestions: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
}

const NewATSAnalysis: React.FC<NewATSAnalysisProps> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [baseATSResult, setBaseATSResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  // Calculate and update base ATS analysis whenever resumeData changes
  useEffect(() => {
    if (resumeData) {
      const result = performBaseATSAnalysis();
      setBaseATSResult(result);
    }
  }, [resumeData]);

  const performBaseATSAnalysis = (): AnalysisResult => {
    if (!resumeData) {
      return {
        overallScore: 0,
        keywordMatch: 0,
        structureScore: 0,
        readabilityScore: 0,
        suggestions: ["Add resume content to get analysis"],
        matchedKeywords: [],
        missingKeywords: [],
        strengths: []
      };
    }
    
    let structureScore = 0;
    let keywordScore = 0;
    let readabilityScore = 60; // Base score
    const suggestions = [];
    const strengths = [];
    
    // Contact information (25%)
    if (resumeData.personalInfo?.name && resumeData.personalInfo?.email && resumeData.personalInfo?.phone) {
      structureScore += 25;
      strengths.push("Complete contact information");
    } else {
      suggestions.push("Complete all contact information fields");
    }
    
    // Summary (25%)
    if (resumeData.summary && resumeData.summary.length > 50) {
      structureScore += 25;
      if (resumeData.summary.length >= 80 && resumeData.summary.length <= 120) {
        strengths.push("Well-sized professional summary");
      }
    } else {
      suggestions.push("Add a professional summary (80-120 words)");
    }
    
    // Work experience (30%)
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      structureScore += 15;
      const hasDetailedExp = resumeData.workExperience.some(exp => 
        exp.responsibilities && exp.responsibilities.length > 2
      );
      if (hasDetailedExp) {
        structureScore += 15;
        strengths.push("Detailed work experience");
      } else {
        suggestions.push("Add more detailed job responsibilities");
      }
    } else {
      suggestions.push("Add work experience");
    }
    
    // Education (20%)
    if (resumeData.education && resumeData.education.length > 0) {
      structureScore += 20;
      strengths.push("Education information included");
    } else {
      suggestions.push("Add education information");
    }
    
    // Keyword analysis based on content
    const allText = [
      resumeData.summary || '',
      ...(resumeData.workExperience?.flatMap(exp => exp.responsibilities || []) || []),
      ...(resumeData.skills?.map(skill => skill.name) || [])
    ].join(' ').toLowerCase();
    
    // Common professional keywords
    const professionalKeywords = ['manage', 'lead', 'develop', 'create', 'implement', 'achieve', 'improve'];
    const foundKeywords = professionalKeywords.filter(keyword => allText.includes(keyword));
    keywordScore = Math.min((foundKeywords.length / professionalKeywords.length) * 100, 100);
    
    if (keywordScore > 60) {
      strengths.push("Good use of action words");
    } else {
      suggestions.push("Use more action verbs (manage, lead, develop, etc.)");
    }
    
    // Check for quantifiable results
    const hasNumbers = allText.match(/\d+%|\d+\+|\$\d+|\d+ years?/gi);
    if (hasNumbers && hasNumbers.length > 0) {
      readabilityScore += 20;
      strengths.push("Includes quantifiable achievements");
    } else {
      suggestions.push("Add quantifiable achievements with numbers");
    }
    
    // Skills assessment
    if (resumeData.skills && resumeData.skills.length >= 5) {
      keywordScore += 15;
      strengths.push("Comprehensive skills section");
    } else {
      suggestions.push("Add more relevant skills (aim for 5+)");
    }
    
    const overallScore = Math.round((structureScore + keywordScore + readabilityScore) / 3);
    
    return {
      overallScore: Math.min(overallScore, 100),
      keywordMatch: Math.min(keywordScore, 100),
      structureScore: Math.min(structureScore, 100),
      readabilityScore: Math.min(readabilityScore, 100),
      suggestions: suggestions.slice(0, 5), // Limit to top 5 suggestions
      matchedKeywords: foundKeywords,
      missingKeywords: professionalKeywords.filter(kw => !foundKeywords.includes(kw)).slice(0, 5),
      strengths: strengths.slice(0, 5) // Limit to top 5 strengths
    };
  };

  const analyzeAgainstJob = async () => {
    toast({
      title: "Feature Coming Back Soon",
      description: "Job-specific resume analysis will be available again shortly!",
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

  const currentResult = baseATSResult || {
    overallScore: 0,
    keywordMatch: 0,
    structureScore: 0,
    readabilityScore: 0,
    suggestions: [],
    matchedKeywords: [],
    missingKeywords: [],
    strengths: []
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">ATS Analysis</h2>
        <p className="text-lg text-muted-foreground">
          Real-time analysis of your resume's compatibility with Applicant Tracking Systems.
        </p>
      </div>

      {/* Base ATS Score - Real-time updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current ATS Compatibility Score
          </CardTitle>
          <CardDescription>
            Live analysis based on your resume content and structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {getScoreIcon(currentResult.overallScore)}
              <div className={`text-4xl font-bold ${getScoreColor(currentResult.overallScore)}`}>
                {currentResult.overallScore}%
              </div>
            </div>
            <Progress value={currentResult.overallScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {currentResult.overallScore >= 80 ? "Excellent ATS compatibility!" :
               currentResult.overallScore >= 60 ? "Good, with room for improvement" :
               "Needs optimization for ATS systems"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className={`text-lg font-semibold ${getScoreColor(currentResult.structureScore)}`}>
                {currentResult.structureScore}%
              </div>
              <p className="text-xs text-muted-foreground">Structure</p>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${getScoreColor(currentResult.keywordMatch)}`}>
                {currentResult.keywordMatch}%
              </div>
              <p className="text-xs text-muted-foreground">Keywords</p>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${getScoreColor(currentResult.readabilityScore)}`}>
                {currentResult.readabilityScore}%
              </div>
              <p className="text-xs text-muted-foreground">Readability</p>
            </div>
          </div>

          {currentResult.strengths.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentResult.strengths.map((strength, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {currentResult.suggestions.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Improvement Suggestions
              </h4>
              <ul className="space-y-1">
                {currentResult.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job-Specific Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Job-Specific Analysis
          </CardTitle>
          <CardDescription>
            Analyze your resume against a specific job posting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Paste Job Description
            </label>
            <Textarea
              placeholder="Paste the job description here to get a targeted analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Coming Back Soon</span>
            </div>
            
            <Button 
              onClick={analyzeAgainstJob}
              disabled={true}
              className="w-full max-w-sm"
            >
              <Zap className="mr-2 h-4 w-4" />
              Coming Back Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewATSAnalysis;
