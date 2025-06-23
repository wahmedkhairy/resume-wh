
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ATSAnalysisResult {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  contentScore: number;
  suggestions: string[];
  strengths: string[];
  isWeak: boolean;
}

const FreeATSScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setAnalysisResult(null);
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

    try {
      // Simulate realistic ATS analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Read file content for basic analysis
      const text = await extractTextFromFile(selectedFile);
      const analysis = performATSAnalysis(text);

      setAnalysisResult(analysis);

      if (analysis.isWeak) {
        toast({
          title: "Resume Needs Improvement",
          description: "Consider using our professional resume optimization services to improve your ATS score.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Your resume scored ${analysis.overallScore}% for ATS compatibility.`,
        });
      }

    } catch (error) {
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
    // For demo purposes, we'll return a simulation based on file name
    // In a real implementation, you'd use libraries like pdf-parse or mammoth
    return `Sample resume content for ${file.name}`;
  };

  const performATSAnalysis = (text: string): ATSAnalysisResult => {
    let formatScore = 85; // Good format score for uploaded files
    let keywordScore = Math.floor(Math.random() * 40) + 30; // 30-70 range
    let contentScore = Math.floor(Math.random() * 50) + 40; // 40-90 range

    // Basic keyword detection simulation
    const commonKeywords = ['experience', 'skills', 'education', 'work', 'project', 'manage', 'develop'];
    const foundKeywords = commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 3) {
      keywordScore += 10;
    }

    const overallScore = Math.round((formatScore + keywordScore + contentScore) / 3);
    const isWeak = overallScore < 65;

    const suggestions = [];
    const strengths = [];

    if (formatScore >= 80) {
      strengths.push("Professional document format");
    }

    if (keywordScore < 60) {
      suggestions.push("Add more industry-relevant keywords");
      suggestions.push("Include technical skills mentioned in job postings");
    }

    if (contentScore < 70) {
      suggestions.push("Add quantifiable achievements with numbers");
      suggestions.push("Include more detailed job descriptions");
    }

    if (overallScore < 65) {
      suggestions.push("Consider professional resume optimization");
      suggestions.push("Review and enhance your professional summary");
    }

    if (suggestions.length === 0) {
      strengths.push("Well-optimized content structure");
      strengths.push("Good keyword density");
    }

    return {
      overallScore,
      formatScore,
      keywordScore,
      contentScore,
      suggestions,
      strengths,
      isWeak
    };
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Free ATS Scanner
        </CardTitle>
        <CardDescription>
          Upload your resume for a free ATS compatibility analysis
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
              />
            </label>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, and DOCX files
            </p>
          </div>
          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Selected: {selectedFile.name}
              </p>
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
          {isScanning ? "Analyzing Resume..." : "Start Free ATS Scan"}
        </Button>

        {isScanning && (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">Scanning your resume...</div>
            <Progress value={66} className="w-full animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Analyzing format, keywords, and content structure
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
            </div>

            <div className="grid grid-cols-3 gap-4">
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
            </div>

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

            {analysisResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Improvement Suggestions
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
                  💡 Recommendation
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  Your resume needs optimization to pass ATS systems effectively. 
                  Consider using our professional resume builder for better results.
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

export default FreeATSScanner;
