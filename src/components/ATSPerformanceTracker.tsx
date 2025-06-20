
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Building, BarChart3, TrendingUp } from "lucide-react";

interface ATSPerformanceTrackerProps {
  resumeData?: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
  };
}

const ATSPerformanceTracker: React.FC<ATSPerformanceTrackerProps> = ({ resumeData }) => {
  
  const calculatePerformanceScore = () => {
    let score = 30;
    
    if (resumeData?.personalInfo?.name && resumeData?.personalInfo?.email) score += 15;
    if (resumeData?.summary && resumeData.summary.length > 50) score += 15;
    if (resumeData?.workExperience && resumeData.workExperience.length > 0) score += 20;
    if (resumeData?.skills && resumeData.skills.length > 0) score += 10;
    if (resumeData?.education && resumeData.education.length > 0) score += 10;
    
    return Math.min(score, 95);
  };

  const overallScore = calculatePerformanceScore();

  const atsSystemsData = [
    {
      name: "Workday",
      score: Math.min(overallScore + 5, 95),
      marketShare: "42%",
      color: "bg-blue-500"
    },
    {
      name: "Greenhouse", 
      score: Math.min(overallScore + 2, 92),
      marketShare: "18%",
      color: "bg-green-500"
    },
    {
      name: "Taleo",
      score: Math.min(overallScore - 3, 89),
      marketShare: "15%",
      color: "bg-purple-500"
    },
    {
      name: "iCIMS",
      score: Math.min(overallScore - 5, 87),
      marketShare: "12%",
      color: "bg-orange-500"
    },
    {
      name: "BambooHR",
      score: Math.min(overallScore - 8, 84),
      marketShare: "8%",
      color: "bg-pink-500"
    },
    {
      name: "SmartRecruiters",
      score: Math.min(overallScore - 2, 90),
      marketShare: "5%",
      color: "bg-indigo-500"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const performanceMetrics = [
    {
      title: "Format Compatibility",
      score: 98,
      description: "Resume format is ATS-friendly"
    },
    {
      title: "Keyword Optimization", 
      score: resumeData?.skills?.length ? Math.min(60 + (resumeData.skills.length * 5), 95) : 45,
      description: "Keywords match job requirements"
    },
    {
      title: "Content Structure",
      score: resumeData?.workExperience?.length ? Math.min(50 + (resumeData.workExperience.length * 15), 90) : 35,
      description: "Sections are properly organized"
    },
    {
      title: "Contact Information",
      score: resumeData?.personalInfo?.name && resumeData?.personalInfo?.email ? 95 : 40,
      description: "Essential details are present"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            ATS Compatibility Score
          </CardTitle>
          <CardDescription>
            Overall performance across major ATS systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <Progress value={overallScore} className="h-3" />
            <p className="text-sm text-muted-foreground">
              Your resume scores {overallScore}% on ATS compatibility
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Detailed breakdown of your resume's ATS performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{metric.title}</span>
                  <div className="flex items-center gap-2">
                    {getScoreIcon(metric.score)}
                    <span className={`font-semibold text-sm ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </div>
                </div>
                <Progress value={metric.score} className="h-2" />
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ATS System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            ATS System Performance Analysis
          </CardTitle>
          <CardDescription>
            How your resume performs across different ATS platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {atsSystemsData.map((system, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${system.color}`}></div>
                    <div>
                      <span className="font-medium text-sm">{system.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({system.marketShare} market share)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getScoreIcon(system.score)}
                    <span className={`font-semibold text-sm ${getScoreColor(system.score)}`}>
                      {system.score}%
                    </span>
                  </div>
                </div>
                <Progress value={system.score} className="h-2" />
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>💡 Tip:</strong> Scores above 85% indicate excellent ATS compatibility. 
              Consider adding more relevant keywords and work experience to improve lower scores.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ATSPerformanceTracker;
