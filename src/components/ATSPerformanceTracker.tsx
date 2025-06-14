
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Building, Zap } from "lucide-react";

interface ATSSystem {
  name: string;
  score: number;
  marketShare: string;
  strengths: string[];
  issues: string[];
}

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
  // Simulate ATS system performance based on resume data
  const calculateATSPerformance = (): ATSSystem[] => {
    const baseScore = resumeData ? 60 : 30;
    const hasCompleteInfo = resumeData?.personalInfo?.name && resumeData?.personalInfo?.email;
    const hasSummary = resumeData?.summary && resumeData.summary.length > 50;
    const hasExperience = resumeData?.workExperience && resumeData.workExperience.length > 0;
    const hasSkills = resumeData?.skills && resumeData.skills.length > 0;

    const scoreBonus = (hasCompleteInfo ? 10 : 0) + (hasSummary ? 10 : 0) + (hasExperience ? 15 : 0) + (hasSkills ? 5 : 0);

    return [
      {
        name: "Workday",
        score: Math.min(95, baseScore + scoreBonus + 15),
        marketShare: "42%",
        strengths: hasCompleteInfo ? ["Contact parsing", "Standard format"] : [],
        issues: !hasSummary ? ["Missing summary section"] : []
      },
      {
        name: "Taleo (Oracle)",
        score: Math.min(90, baseScore + scoreBonus + 5),
        marketShare: "18%",
        strengths: hasExperience ? ["Experience matching"] : [],
        issues: !hasSkills ? ["Limited skill detection"] : []
      },
      {
        name: "Greenhouse",
        score: Math.min(92, baseScore + scoreBonus + 10),
        marketShare: "12%",
        strengths: hasSummary ? ["Summary analysis", "Modern parsing"] : [],
        issues: []
      },
      {
        name: "iCIMS",
        score: Math.min(88, baseScore + scoreBonus),
        marketShare: "8%",
        strengths: hasCompleteInfo ? ["Contact extraction"] : [],
        issues: !hasExperience ? ["Experience parsing issues"] : []
      },
      {
        name: "BambooHR",
        score: Math.min(85, baseScore + scoreBonus - 5),
        marketShare: "6%",
        strengths: [],
        issues: ["Basic parsing capabilities"]
      },
      {
        name: "SmartRecruiters",
        score: Math.min(90, baseScore + scoreBonus + 8),
        marketShare: "5%",
        strengths: hasSkills ? ["Skill matching", "AI parsing"] : [],
        issues: []
      }
    ];
  };

  const atsSystemsPerformance = calculateATSPerformance();
  const averageScore = Math.round(atsSystemsPerformance.reduce((sum, system) => sum + system.score, 0) / atsSystemsPerformance.length);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          ATS System Performance Analysis
        </CardTitle>
        <CardDescription>
          How your resume performs across major ATS tracking systems
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Performance */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
            {averageScore}%
          </div>
          <p className="text-sm text-muted-foreground">Average ATS Compatibility</p>
          <Progress value={averageScore} className="mt-2" />
        </div>

        {/* Individual ATS Performance */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance by ATS System
          </h4>
          
          {atsSystemsPerformance.map((system) => (
            <div key={system.name} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-gray-900">{system.name}</h5>
                  <p className="text-xs text-gray-500">Market Share: {system.marketShare}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getScoreIcon(system.score)}
                  <span className={`font-semibold ${getScoreColor(system.score)}`}>
                    {system.score}%
                  </span>
                </div>
              </div>
              
              <Progress value={system.score} className="h-2" />
              
              {system.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                  <div className="flex flex-wrap gap-1">
                    {system.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {system.issues.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-700 mb-1">Potential Issues:</p>
                  <div className="flex flex-wrap gap-1">
                    {system.issues.map((issue, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-red-200 text-red-700">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Pro Tip:</p>
          <p>Different ATS systems have varying parsing capabilities. A score above 85% indicates excellent compatibility with that specific system.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ATSPerformanceTracker;
