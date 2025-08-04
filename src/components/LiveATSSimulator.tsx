
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, XCircle, Zap, Target, TrendingUp, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveATSSimulatorProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

interface ATSAnalysis {
  overallScore: number;
  keywordMatch: number;
  formatScore: number;
  experienceMatch: number;
  skillsMatch: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendations: string[];
  atsCompatibility: 'excellent' | 'good' | 'fair' | 'poor';
}

const LiveATSSimulator: React.FC<LiveATSSimulatorProps> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeResume = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please paste a job description to analyze your resume against.",
        variant: "destructive",
      });
      return;
    }

    if (!resumeData) {
      toast({
        title: "Resume Data Missing",
        description: "Please complete your resume before running the ATS analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      console.log('Starting AI-powered job match analysis...');

      // Call the new AI-powered ATS analysis for job matching
      const response = await fetch('/supabase/functions/v1/advanced-ats-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          jobDescription,
          analysisType: 'job-match'
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status: ${response.status}`);
      }

      const aiAnalysis = await response.json();
      
      console.log('AI job match analysis complete:', aiAnalysis);

      // Determine compatibility based on overall score
      let atsCompatibility: 'excellent' | 'good' | 'fair' | 'poor';
      if (aiAnalysis.overallScore >= 85) atsCompatibility = 'excellent';
      else if (aiAnalysis.overallScore >= 70) atsCompatibility = 'good';
      else if (aiAnalysis.overallScore >= 55) atsCompatibility = 'fair';
      else atsCompatibility = 'poor';

      setAnalysis({
        overallScore: aiAnalysis.overallScore,
        keywordMatch: aiAnalysis.keywordScore,
        formatScore: aiAnalysis.formatScore,
        experienceMatch: aiAnalysis.contentScore, // Map content score to experience match
        skillsMatch: aiAnalysis.structureScore, // Map structure score to skills match
        matchedKeywords: aiAnalysis.matchedKeywords || [],
        missingKeywords: aiAnalysis.missingKeywords || [],
        recommendations: aiAnalysis.suggestions || [],
        atsCompatibility
      });

      toast({
        title: "AI Analysis Complete",
        description: `Your resume scored ${aiAnalysis.overallScore}% for this position.`,
      });

    } catch (error) {
      console.error('AI analysis failed, using fallback analysis:', error);
      
      // Fallback to basic analysis if AI fails
      await performFallbackAnalysis();
      
      toast({
        title: "Analysis Complete (Basic Mode)",
        description: "Analysis completed using basic algorithms. For enhanced AI analysis, please try again later.",
        variant: "default",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performFallbackAnalysis = async () => {
    // Simulate realistic timing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract keywords from job description
    const jobKeywords = extractKeywords(jobDescription);
    const resumeText = buildResumeText(resumeData);
    const resumeKeywords = extractKeywords(resumeText);

    // Calculate matches
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeKeywords.some(rKeyword => 
        rKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(rKeyword.toLowerCase())
      )
    );

    const missingKeywords = jobKeywords.filter(keyword => 
      !matchedKeywords.some(matched => 
        matched.toLowerCase() === keyword.toLowerCase()
      )
    ).slice(0, 8);

    // Calculate scores
    const keywordMatch = Math.round((matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100);
    const formatScore = calculateFormatScore(resumeData);
    const experienceMatch = calculateExperienceMatch(resumeData, jobDescription);
    const skillsMatch = calculateSkillsMatch(resumeData, jobDescription);
    const overallScore = Math.round((keywordMatch + formatScore + experienceMatch + skillsMatch) / 4);

    // Determine compatibility
    let atsCompatibility: 'excellent' | 'good' | 'fair' | 'poor';
    if (overallScore >= 85) atsCompatibility = 'excellent';
    else if (overallScore >= 70) atsCompatibility = 'good';
    else if (overallScore >= 55) atsCompatibility = 'fair';
    else atsCompatibility = 'poor';

    // Generate recommendations
    const recommendations = generateRecommendations(overallScore, keywordMatch, missingKeywords);

    setAnalysis({
      overallScore,
      keywordMatch,
      formatScore,
      experienceMatch,
      skillsMatch,
      matchedKeywords: matchedKeywords.slice(0, 10),
      missingKeywords,
      recommendations,
      atsCompatibility
    });
  };

  const extractKeywords = (text: string): string[] => {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'a', 'an', 'as', 'if', 'then', 'than', 'when', 'where', 'who', 'which', 'why', 'how'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .filter((word, index, arr) => arr.indexOf(word) === index)
      .slice(0, 30);
  };

  const buildResumeText = (data: any): string => {
    let text = '';
    if (data.summary) text += data.summary + ' ';
    if (data.workExperience) {
      data.workExperience.forEach((job: any) => {
        text += `${job.jobTitle} ${job.company} `;
        job.responsibilities?.forEach((resp: string) => text += resp + ' ');
      });
    }
    if (data.skills) {
      data.skills.forEach((skill: any) => text += skill.name + ' ');
    }
    return text;
  };

  const calculateFormatScore = (data: any): number => {
    let score = 60; // Base score
    if (data.personalInfo?.email) score += 10;
    if (data.personalInfo?.phone) score += 10;
    if (data.summary && data.summary.length > 50) score += 10;
    if (data.workExperience?.length > 0) score += 10;
    return Math.min(100, score);
  };

  const calculateExperienceMatch = (data: any, jobDesc: string): number => {
    if (!data.workExperience?.length) return 30;
    
    const jobWords = jobDesc.toLowerCase();
    let matchScore = 50;
    
    data.workExperience.forEach((job: any) => {
      if (jobWords.includes(job.jobTitle?.toLowerCase()) || 
          jobWords.includes(job.company?.toLowerCase())) {
        matchScore += 15;
      }
    });
    
    return Math.min(100, matchScore);
  };

  const calculateSkillsMatch = (data: any, jobDesc: string): number => {
    if (!data.skills?.length) return 40;
    
    const jobWords = jobDesc.toLowerCase();
    let matchedSkills = 0;
    
    data.skills.forEach((skill: any) => {
      if (jobWords.includes(skill.name?.toLowerCase())) {
        matchedSkills++;
      }
    });
    
    return Math.min(100, 40 + (matchedSkills * 15));
  };

  const generateRecommendations = (score: number, keywordMatch: number, missingKeywords: string[]): string[] => {
    const recommendations = [];
    
    if (keywordMatch < 60) {
      recommendations.push(`Add these missing keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
    }
    
    if (score < 70) {
      recommendations.push("Tailor your work experience descriptions to match the job requirements");
      recommendations.push("Add more specific technical skills mentioned in the job posting");
    }
    
    if (score < 85) {
      recommendations.push("Include quantifiable achievements and metrics in your experience");
      recommendations.push("Optimize your professional summary to include key job requirements");
    }
    
    return recommendations;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    if (score >= 55) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Live ATS Simulator
        </CardTitle>
        <CardDescription>
          Analyze your resume against real job descriptions and get an instant ATS compatibility score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Description</label>
          <Textarea
            placeholder="Paste the job description you want to apply for here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={analyzeResume}
          disabled={isAnalyzing || !jobDescription.trim()}
          className="w-full"
          size="lg"
        >
          <Zap className="mr-2 h-4 w-4" />
          {isAnalyzing ? "Analyzing Resume..." : "Run ATS Analysis"}
        </Button>

        {isAnalyzing && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">Analyzing your resume...</div>
              <Progress value={33} className="w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <Separator />
            
            {/* Overall Score */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getScoreIcon(analysis.overallScore)}
                <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {analysis.overallScore}%
                </span>
              </div>
              <p className="text-muted-foreground">
                ATS Compatibility Score - {analysis.atsCompatibility.charAt(0).toUpperCase() + analysis.atsCompatibility.slice(1)}
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Keyword Match</span>
                    <span className={`font-semibold ${getScoreColor(analysis.keywordMatch)}`}>
                      {analysis.keywordMatch}%
                    </span>
                  </div>
                  <Progress value={analysis.keywordMatch} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Format Score</span>
                    <span className={`font-semibold ${getScoreColor(analysis.formatScore)}`}>
                      {analysis.formatScore}%
                    </span>
                  </div>
                  <Progress value={analysis.formatScore} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Experience Match</span>
                    <span className={`font-semibold ${getScoreColor(analysis.experienceMatch)}`}>
                      {analysis.experienceMatch}%
                    </span>
                  </div>
                  <Progress value={analysis.experienceMatch} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Skills Match</span>
                    <span className={`font-semibold ${getScoreColor(analysis.skillsMatch)}`}>
                      {analysis.skillsMatch}%
                    </span>
                  </div>
                  <Progress value={analysis.skillsMatch} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Keywords Analysis */}
            {analysis.matchedKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Matched Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.missingKeywords.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveATSSimulator;
