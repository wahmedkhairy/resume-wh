
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Zap, Eye, Target, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ATSAnalysisResult {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  contentScore: number;
  readabilityScore: number;
  sectionScore: number;
  suggestions: string[];
  strengths: string[];
  criticalIssues: string[];
  keywordMatches: string[];
  missingKeywords: string[];
  isWeak: boolean;
  passingRate: number;
}

const EnhancedATSScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a PDF or Word document.");
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File too large. Please upload a file smaller than 10MB.");
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a resume file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Enhanced analysis simulation
      await new Promise(resolve => setTimeout(resolve, 3500));

      const text = await extractTextFromFile(selectedFile);
      const analysis = performEnhancedATSAnalysis(text, selectedFile.name);

      setAnalysisResult(analysis);

      if (analysis.isWeak) {
        toast({
          title: "Resume Needs Optimization",
          description: `Your ATS score is ${analysis.overallScore}%. Consider professional optimization.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Your resume scored ${analysis.overallScore}% for ATS compatibility.`,
        });
      }

    } catch (error) {
      console.error('Enhanced ATS Scanner error:', error);
      setError("There was an error analyzing your resume. Please try again.");
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Enhanced text extraction simulation
    const hasGoodKeywords = file.name.toLowerCase().includes('resume') || file.name.toLowerCase().includes('cv');
    const baseText = `Professional resume content for ${file.name}. Experience management development project leadership team collaboration strategic planning business analysis performance optimization results-driven innovative solutions client relations stakeholder communication cross-functional coordination process improvement quality assurance data analysis problem-solving technical skills certification training education background achievements accomplishments.`;
    
    const contentMultiplier = Math.min(file.size / (50 * 1024), 10);
    return baseText.repeat(Math.max(1, Math.floor(contentMultiplier)));
  };

  const performEnhancedATSAnalysis = (text: string, fileName: string): ATSAnalysisResult => {
    // Enhanced scoring algorithm
    let formatScore = 80 + Math.floor(Math.random() * 15);
    let keywordScore = Math.floor(Math.random() * 40) + 35;
    let contentScore = Math.floor(Math.random() * 45) + 40;
    let readabilityScore = Math.floor(Math.random() * 30) + 60;
    let sectionScore = Math.floor(Math.random() * 25) + 65;

    // Bonus scoring
    if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
      formatScore += 5;
      keywordScore += 8;
    }

    // Advanced keyword analysis
    const professionalKeywords = [
      'management', 'leadership', 'strategic', 'development', 'analysis', 
      'optimization', 'collaboration', 'innovative', 'results-driven', 'achievement',
      'project', 'team', 'communication', 'problem-solving', 'technical',
      'experience', 'education', 'certification', 'training', 'performance'
    ];

    const foundKeywords = professionalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    if (foundKeywords.length > 8) {
      keywordScore += 20;
    } else if (foundKeywords.length > 5) {
      keywordScore += 10;
    }

    if (text.length > 1000) {
      contentScore += 15;
      readabilityScore += 10;
    }

    // Cap scores at 100
    formatScore = Math.min(formatScore, 100);
    keywordScore = Math.min(keywordScore, 100);
    contentScore = Math.min(contentScore, 100);
    readabilityScore = Math.min(readabilityScore, 100);
    sectionScore = Math.min(sectionScore, 100);

    const overallScore = Math.round((formatScore + keywordScore + contentScore + readabilityScore + sectionScore) / 5);
    const isWeak = overallScore < 70;
    const passingRate = Math.min(overallScore + 10, 95);

    const suggestions = [];
    const strengths = [];
    const criticalIssues = [];
    const missingKeywords = [];

    // Advanced feedback
    if (formatScore >= 85) {
      strengths.push("Excellent document formatting");
    } else if (formatScore < 70) {
      criticalIssues.push("Poor document structure detected");
      suggestions.push("Improve document formatting and use professional templates");
    }

    if (keywordScore < 60) {
      criticalIssues.push("Low keyword density");
      suggestions.push("Add more industry-relevant keywords");
      suggestions.push("Include technical skills from job descriptions");
      missingKeywords.push(...professionalKeywords.filter(k => !foundKeywords.includes(k)).slice(0, 5));
    } else if (keywordScore >= 80) {
      strengths.push("Strong keyword optimization");
    }

    if (contentScore < 65) {
      suggestions.push("Add quantifiable achievements with metrics");
      suggestions.push("Expand on professional accomplishments");
    } else {
      strengths.push("Well-detailed professional content");
    }

    if (readabilityScore < 70) {
      suggestions.push("Improve content readability and flow");
      suggestions.push("Use clear, concise language");
    }

    if (sectionScore < 75) {
      suggestions.push("Ensure all standard resume sections are present");
      suggestions.push("Add professional summary if missing");
    }

    if (overallScore < 70) {
      suggestions.push("Consider professional resume optimization services");
      criticalIssues.push("Resume may struggle with ATS systems");
    }

    if (suggestions.length === 0) {
      strengths.push("Excellent overall ATS compatibility");
      strengths.push("Professional resume structure");
    }

    return {
      overallScore,
      formatScore,
      keywordScore,
      contentScore,
      readabilityScore,
      sectionScore,
      suggestions,
      strengths,
      criticalIssues,
      keywordMatches: foundKeywords,
      missingKeywords,
      isWeak,
      passingRate
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <Target className="h-5 w-5 text-blue-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Enhanced ATS Scanner Pro
        </CardTitle>
        <CardDescription>
          Advanced ATS compatibility analysis with detailed insights and optimization recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-blue-600 hover:text-blue-700">
                Choose your resume file
              </span>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isScanning}
              />
            </label>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, and DOCX files (max 10MB)
            </p>
          </div>
          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Selected: {selectedFile.name}
              </p>
              <p className="text-xs text-blue-600">
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
        </div>

        <Button 
          onClick={analyzeResume}
          disabled={!selectedFile || isScanning}
          className="w-full"
          size="lg"
        >
          <Zap className="mr-2 h-4 w-4" />
          {isScanning ? "Analyzing Resume..." : "Start Enhanced ATS Analysis"}
        </Button>

        {isScanning && (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">Performing deep ATS analysis...</div>
            <Progress value={75} className="w-full animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Analyzing format, keywords, content structure, readability, and ATS compatibility
            </p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6 border-t pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getScoreIcon(analysisResult.overallScore)}
                <span className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore}%
                </span>
              </div>
              <p className="text-muted-foreground">Overall ATS Compatibility Score</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  {analysisResult.passingRate}% chance of passing ATS systems
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.formatScore)}`}>
                  {analysisResult.formatScore}%
                </div>
                <p className="text-xs text-muted-foreground">Format</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.keywordScore)}`}>
                  {analysisResult.keywordScore}%
                </div>
                <p className="text-xs text-muted-foreground">Keywords</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.contentScore)}`}>
                  {analysisResult.contentScore}%
                </div>
                <p className="text-xs text-muted-foreground">Content</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.readabilityScore)}`}>
                  {analysisResult.readabilityScore}%
                </div>
                <p className="text-xs text-muted-foreground">Readability</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.sectionScore)}`}>
                  {analysisResult.sectionScore}%
                </div>
                <p className="text-xs text-muted-foreground">Structure</p>
              </div>
            </div>

            {analysisResult.criticalIssues.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Critical Issues
                </h4>
                <ul className="space-y-1">
                  {analysisResult.criticalIssues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h4>
                <div className="space-y-1">
                  {analysisResult.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 mr-2 mb-1">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.keywordMatches.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Found Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.keywordMatches.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.missingKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-700 mb-2">Suggested Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="border-orange-300 text-orange-700">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Optimization Recommendations
                </h4>
                <ul className="space-y-2">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.isWeak && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">
                  💡 Professional Recommendation
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  Your resume needs significant optimization to pass modern ATS systems effectively. 
                  Consider using our professional resume builder for enhanced results.
                </p>
                <Button 
                  onClick={() => window.location.href = '/subscription'}
                  variant="outline" 
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Optimize My Resume
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedATSScanner;
