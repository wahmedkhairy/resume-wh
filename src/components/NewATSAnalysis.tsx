import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertTriangle, XCircle, Target, FileText, Clock, TrendingUp } from "lucide-react";
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
}

const NewATSAnalysis: React.FC<NewATSAnalysisProps> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const calculateATSScore = () => {
    if (!resumeData) return 0;
    
    let score = 0;
    
    // Contact information (20%)
    if (resumeData.personalInfo?.name && resumeData.personalInfo?.email && resumeData.personalInfo?.phone) {
      score += 20;
    }
    
    // Summary (20%)
    if (resumeData.summary && resumeData.summary.length > 50) {
      score += 20;
    }
    
    // Work experience (30%)
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      score += 15;
      const hasDetailedExp = resumeData.workExperience.some(exp => 
        exp.responsibilities && exp.responsibilities.length > 2
      );
      if (hasDetailedExp) score += 15;
    }
    
    // Skills (15%)
    if (resumeData.skills && resumeData.skills.length >= 5) {
      score += 15;
    } else if (resumeData.skills && resumeData.skills.length > 0) {
      score += 8;
    }
    
    // Education (15%)
    if (resumeData.education && resumeData.education.length > 0) {
      score += 15;
    }
    
    return Math.min(score, 100);
  };

  const analyzeAgainstJob = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description to analyze against.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const baseScore = calculateATSScore();
      const keywordMatch = Math.round(baseScore * 0.8); // Sync with base score
      const structureScore = baseScore;
      const readabilityScore = Math.round(baseScore * 0.9);
      const overallScore = baseScore; // Use the same score as base ATS

      const suggestions = generateSuggestions(keywordMatch, structureScore, []);
      
      setAnalysisResult({
        overallScore,
        keywordMatch,
        structureScore,
        readabilityScore,
        suggestions,
        matchedKeywords: ['experience', 'skills', 'education'].slice(0, Math.floor(keywordMatch / 20)),
        missingKeywords: ['leadership', 'teamwork', 'project management'].slice(0, Math.floor((100 - keywordMatch) / 20))
      });
      
      toast({
        title: "Analysis Complete",
        description: `Your resume scored ${overallScore}% for this position.`,
      });
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSuggestions = (keywordMatch: number, structureScore: number, missingKeywords: string[]): string[] => {
    const suggestions = [];
    
    if (keywordMatch < 60) {
      suggestions.push("Add more industry-relevant keywords");
    }
    
    if (structureScore < 70) {
      suggestions.push("Complete all sections (contact info, summary, experience, education, skills)");
    }
    
    if (!resumeData?.summary || resumeData.summary.length < 100) {
      suggestions.push("Add a compelling professional summary (100-200 words)");
    }
    
    suggestions.push("Use action verbs and quantifiable achievements");
    suggestions.push("Tailor your experience descriptions to match job requirements");
    
    return suggestions;
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

  const baseScore = calculateATSScore();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">ATS Analysis</h2>
        <p className="text-lg text-muted-foreground">
          Optimize your resume for Applicant Tracking Systems and get real-time feedback.
        </p>
      </div>

      {/* Base ATS Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Current ATS Score
          </CardTitle>
          <CardDescription>
            Based on your resume content and structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(baseScore)}`}>
              {baseScore}%
            </div>
            <Progress value={baseScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {baseScore >= 80 ? "Excellent ATS compatibility!" :
               baseScore >= 60 ? "Good, but room for improvement" :
               "Needs significant optimization"}
            </p>
          </div>
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
          
          <Button 
            disabled={true}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Clock className="mr-2 h-4 w-4" />
            Analyze Resume - Coming Back Soon
          </Button>

          {analysisResult && (
            <div className="space-y-4 border-t pt-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore}%
                </div>
                <p className="text-sm text-muted-foreground">Job Match Score</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(analysisResult.keywordMatch)}`}>
                    {analysisResult.keywordMatch}%
                  </div>
                  <p className="text-xs text-muted-foreground">Keywords</p>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(analysisResult.structureScore)}`}>
                    {analysisResult.structureScore}%
                  </div>
                  <p className="text-xs text-muted-foreground">Structure</p>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-semibold ${getScoreColor(analysisResult.readabilityScore)}`}>
                    {analysisResult.readabilityScore}%
                  </div>
                  <p className="text-xs text-muted-foreground">Readability</p>
                </div>
              </div>

              {analysisResult.matchedKeywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✓ Matched Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.matchedKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.missingKeywords.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">⚠ Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingKeywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {analysisResult.suggestions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Improvement Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-500 mt-1">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewATSAnalysis;
