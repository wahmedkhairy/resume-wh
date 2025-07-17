
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Zap, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ATSAnalysisResult {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  contentScore: number;
  suggestions: string[];
  strengths: string[];
  isWeak: boolean;
  extractedData?: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      jobTitle: string;
    };
    summary: string;
    workExperience: Array<{
      id: string;
      jobTitle: string;
      company: string;
      startDate: string;
      endDate: string;
      location: string;
      responsibilities: string[];
    }>;
    education: Array<{
      id: string;
      degree: string;
      institution: string;
      graduationYear: string;
      location: string;
    }>;
    skills: Array<{
      id: string;
      name: string;
      level: number;
    }>;
  };
}

const FreeATSScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File too large. Please upload a file smaller than 5MB.");
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const extractResumeData = (fileName: string, fileSize: number): ATSAnalysisResult['extractedData'] => {
    // Enhanced mock data extraction based on file characteristics
    // In a real implementation, you'd use libraries like pdf-parse or mammoth to extract actual content
    
    const mockData = {
      personalInfo: {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "(555) 123-4567",
        location: "New York, NY",
        jobTitle: "Software Engineer"
      },
      summary: "Experienced software engineer with 5+ years of experience in full-stack development. Proficient in React, Node.js, and cloud technologies.",
      workExperience: [
        {
          id: "exp1",
          jobTitle: "Senior Software Engineer",
          company: "Tech Corp",
          startDate: "2022-01",
          endDate: "Present",
          location: "New York, NY",
          responsibilities: [
            "Developed and maintained web applications using React and Node.js",
            "Collaborated with cross-functional teams to deliver high-quality software",
            "Implemented CI/CD pipelines to improve deployment efficiency"
          ]
        },
        {
          id: "exp2",
          jobTitle: "Software Developer",
          company: "StartupXYZ",
          startDate: "2020-06",
          endDate: "2021-12",
          location: "San Francisco, CA",
          responsibilities: [
            "Built responsive web applications using modern JavaScript frameworks",
            "Worked with RESTful APIs and database optimization"
          ]
        }
      ],
      education: [
        {
          id: "edu1",
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          graduationYear: "2020",
          location: "California"
        }
      ],
      skills: [
        { id: "skill1", name: "JavaScript", level: 90 },
        { id: "skill2", name: "React", level: 85 },
        { id: "skill3", name: "Node.js", level: 80 },
        { id: "skill4", name: "Python", level: 75 },
        { id: "skill5", name: "SQL", level: 70 }
      ]
    };

    // Customize based on file name patterns
    if (fileName.toLowerCase().includes('marketing')) {
      mockData.personalInfo.jobTitle = "Marketing Manager";
      mockData.workExperience[0].jobTitle = "Senior Marketing Manager";
      mockData.skills = [
        { id: "skill1", name: "Digital Marketing", level: 90 },
        { id: "skill2", name: "SEO/SEM", level: 85 },
        { id: "skill3", name: "Content Strategy", level: 80 },
        { id: "skill4", name: "Analytics", level: 75 },
        { id: "skill5", name: "Social Media", level: 85 }
      ];
    }

    return mockData;
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
      // Simulate realistic ATS analysis with proper error handling
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Extract resume data
      const extractedData = extractResumeData(selectedFile.name, selectedFile.size);

      // Read file content for basic analysis
      const text = await extractTextFromFile(selectedFile);
      const analysis = performATSAnalysis(text, selectedFile.name, extractedData);

      setAnalysisResult(analysis);

      if (analysis.isWeak) {
        toast({
          title: "Resume Needs Improvement",
          description: "Your resume scored below 80%. Consider using our resume builder to improve your ATS compatibility.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Your resume scored ${analysis.overallScore}% for ATS compatibility.`,
        });
      }

    } catch (error) {
      console.error('Free ATS Scanner error:', error);
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
    // For demo purposes, we'll return a simulation based on file name and size
    // In a real implementation, you'd use libraries like pdf-parse or mammoth
    const hasGoodKeywords = file.name.toLowerCase().includes('resume') || file.name.toLowerCase().includes('cv');
    const baseText = `Sample resume content for ${file.name}. `;
    
    // Simulate content based on file size (larger files typically have more content)
    const contentMultiplier = Math.min(file.size / (100 * 1024), 5); // Scale based on file size
    return baseText.repeat(Math.max(1, Math.floor(contentMultiplier)));
  };

  const performATSAnalysis = (text: string, fileName: string, extractedData: any): ATSAnalysisResult => {
    let formatScore = 85; // Good format score for uploaded files
    let keywordScore = Math.floor(Math.random() * 40) + 30; // 30-70 range
    let contentScore = Math.floor(Math.random() * 50) + 40; // 40-90 range

    // Improve scores based on file characteristics
    if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
      formatScore += 5;
      keywordScore += 10;
    }

    // Basic keyword detection simulation
    const commonKeywords = ['experience', 'skills', 'education', 'work', 'project', 'manage', 'develop', 'achievement'];
    const foundKeywords = commonKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    if (foundKeywords.length > 3) {
      keywordScore += 15;
    }

    // Content analysis based on text length
    if (text.length > 500) {
      contentScore += 10;
    }

    // Ensure scores don't exceed 100
    formatScore = Math.min(formatScore, 100);
    keywordScore = Math.min(keywordScore, 100);
    contentScore = Math.min(contentScore, 100);

    const overallScore = Math.round((formatScore + keywordScore + contentScore) / 3);
    const isWeak = overallScore < 80;

    const suggestions = [];
    const strengths = [];

    if (formatScore >= 80) {
      strengths.push("Professional document format");
    } else {
      suggestions.push("Improve document formatting and structure");
    }

    if (keywordScore < 60) {
      suggestions.push("Add more industry-relevant keywords");
      suggestions.push("Include technical skills mentioned in job postings");
    } else {
      strengths.push("Good keyword usage");
    }

    if (contentScore < 70) {
      suggestions.push("Add quantifiable achievements with numbers");
      suggestions.push("Include more detailed job descriptions");
    } else {
      strengths.push("Well-detailed content");
    }

    if (overallScore < 80) {
      suggestions.push("Use action verbs to start bullet points");
      suggestions.push("Include relevant certifications and courses");
      suggestions.push("Optimize your professional summary");
    }

    if (suggestions.length === 0) {
      strengths.push("Well-optimized content structure");
      strengths.push("Excellent ATS compatibility");
    }

    return {
      overallScore,
      formatScore,
      keywordScore,
      contentScore,
      suggestions,
      strengths,
      isWeak,
      extractedData
    };
  };

  const handleFixResume = () => {
    if (analysisResult?.extractedData) {
      // Store the extracted data in localStorage to transfer to resume builder
      localStorage.setItem('uploadedResumeData', JSON.stringify(analysisResult.extractedData));
      localStorage.setItem('resumeImprovementTips', JSON.stringify(analysisResult.suggestions));
      
      toast({
        title: "Redirecting to Resume Builder",
        description: "Your resume data has been extracted and will be loaded in the builder.",
      });

      // Navigate to the resume builder
      navigate('/');
    }
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
                disabled={isScanning}
              />
            </label>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, and DOCX files (max 5MB)
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

            {analysisResult.overallScore < 80 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-6 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  🚨 Resume Needs Optimization
                </h4>
                <p className="text-sm text-orange-700 mb-4">
                  Your resume scored {analysisResult.overallScore}% and needs improvement to pass ATS systems effectively. 
                  Let our AI-powered resume builder automatically fix these issues and optimize your resume for better results.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleFixResume}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                    size="sm"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Fix My Resume - Free
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/subscription'}
                    variant="outline" 
                    size="sm"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Get Premium Features
                  </Button>
                </div>
              </div>
            )}

            {analysisResult.overallScore >= 80 && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  ✅ Great Job!
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Your resume has good ATS compatibility! You can still use our resume builder to create an even more polished version.
                </p>
                <Button 
                  onClick={handleFixResume}
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Enhance My Resume
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
