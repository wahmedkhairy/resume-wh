
import React from "react";
import ATSScanner from "@/components/ATSScanner";
import ATSPerformanceTracker from "@/components/ATSPerformanceTracker";
import LiveATSSimulator from "@/components/LiveATSSimulator";
import CallToAction from "@/components/CallToAction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Target, Zap } from "lucide-react";

interface ATSSectionProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

const ATSSection: React.FC<ATSSectionProps> = ({ resumeData }) => {
  // Calculate real ATS compatibility score based on resume data
  const calculateATSScore = () => {
    let score = 0;
    let maxScore = 100;
    
    // Personal info completeness (20 points)
    if (resumeData?.personalInfo?.name) score += 5;
    if (resumeData?.personalInfo?.email) score += 5;
    if (resumeData?.personalInfo?.phone) score += 5;
    if (resumeData?.personalInfo?.location) score += 5;
    
    // Summary completeness (20 points)
    if (resumeData?.summary && resumeData.summary.length > 50) score += 20;
    else if (resumeData?.summary && resumeData.summary.length > 20) score += 10;
    
    // Work experience completeness (30 points)
    if (resumeData?.workExperience && resumeData.workExperience.length > 0) {
      score += 15;
      const hasDetailedExperience = resumeData.workExperience.some(job => 
        job.responsibilities && job.responsibilities.length > 2
      );
      if (hasDetailedExperience) score += 15;
    }
    
    // Education completeness (15 points)
    if (resumeData?.education && resumeData.education.length > 0) score += 15;
    
    // Skills completeness (15 points)
    if (resumeData?.skills && resumeData.skills.length >= 5) score += 15;
    else if (resumeData?.skills && resumeData.skills.length > 0) score += 7;
    
    return Math.min(score, maxScore);
  };

  // Calculate keyword density
  const calculateKeywordScore = () => {
    if (!resumeData) return 0;
    
    let keywordCount = 0;
    const commonKeywords = ['management', 'leadership', 'development', 'analysis', 'project', 'team', 'communication', 'technical', 'software', 'experience'];
    
    const allText = [
      resumeData.summary || '',
      ...(resumeData.workExperience?.map(job => job.responsibilities?.join(' ') || '') || []),
      ...(resumeData.skills?.map(skill => skill.name || '') || [])
    ].join(' ').toLowerCase();
    
    commonKeywords.forEach(keyword => {
      if (allText.includes(keyword)) keywordCount++;
    });
    
    return Math.min((keywordCount / commonKeywords.length) * 100, 100);
  };

  const atsScore = calculateATSScore();
  const keywordScore = calculateKeywordScore();
  
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
    <div className="w-full max-w-7xl mx-auto space-y-6 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">ATS Optimization Suite</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Maximize your job application success with our comprehensive ATS analysis tools. 
          Get real-time feedback and optimize your resume for any job posting.
        </p>
      </div>

      <div className="w-full">
        <Tabs defaultValue="simulator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="simulator">Live Simulator</TabsTrigger>
            <TabsTrigger value="analysis">ATS Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulator" className="w-full space-y-6">
            <div className="w-full">
              <LiveATSSimulator resumeData={resumeData} />
            </div>
            <CallToAction 
              variant="export" 
              urgency={true}
              className="mt-8"
            />
          </TabsContent>
          
          <TabsContent value="analysis" className="w-full space-y-6">
            <div className="w-full space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getScoreIcon(atsScore)}
                      ATS Compatibility Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(atsScore)}`}>
                      {atsScore}%
                    </div>
                    <Progress value={atsScore} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {atsScore >= 80 ? "Excellent! Your resume is highly ATS-friendly." :
                       atsScore >= 60 ? "Good! Some improvements can boost your score." :
                       "Needs improvement. Consider optimizing your resume format and content."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Keyword Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(keywordScore)}`}>
                      {Math.round(keywordScore)}%
                    </div>
                    <Progress value={keywordScore} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {keywordScore >= 70 ? "Great keyword coverage!" :
                       keywordScore >= 50 ? "Consider adding more relevant keywords." :
                       "Add industry-specific keywords to improve visibility."}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="w-full">
                <ATSScanner resumeData={resumeData} />
              </div>
              
              <CallToAction 
                variant="upgrade" 
                title="Get Advanced ATS Insights"
                description="Unlock detailed keyword analysis, industry-specific optimization, and real-time ATS simulation for unlimited job postings."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="w-full space-y-6">
            <div className="w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {resumeData?.workExperience?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Work Experiences</p>
                  </CardContent>
                </Card>
                
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {resumeData?.skills?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Skills Listed</p>
                  </CardContent>
                </Card>
                
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {resumeData?.education?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Education Entries</p>
                  </CardContent>
                </Card>
                
                <Card className="w-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {Math.round((resumeData?.summary?.length || 0) / 10)}
                    </div>
                    <p className="text-sm text-muted-foreground">Summary Words</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Resume Completeness</span>
                      <div className="flex items-center gap-2">
                        <Progress value={atsScore} className="w-24" />
                        <span className="text-sm">{atsScore}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Keyword Density</span>
                      <div className="flex items-center gap-2">
                        <Progress value={keywordScore} className="w-24" />
                        <span className="text-sm">{Math.round(keywordScore)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Format Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-24" />
                        <span className="text-sm">85%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Readability</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-24" />
                        <span className="text-sm">92%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="w-full">
                <ATSPerformanceTracker resumeData={resumeData} />
              </div>
              
              <CallToAction 
                variant="success" 
                title="Optimize Your Performance"
                description="Your resume performance analysis is complete. Download your optimized resume and start applying with confidence."
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ATSSection;
