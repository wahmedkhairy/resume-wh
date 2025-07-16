
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Zap, Crown, Download, FileText, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import LiveSubscriptionDialog from "@/components/LiveSubscriptionDialog";

interface FixMyResumeNowProps {
  resumeData: {
    personalInfo?: any;
    summary?: string;
    workExperience?: any[];
    education?: any[];
    skills?: any[];
    coursesAndCertifications?: any[];
    projects?: any[];
  };
  currentUserId: string;
  isPremiumUser: boolean;
  currentSubscription: any;
  onApplyOptimizations: (optimizations: any) => void;
  onExport: () => void;
  canExport: boolean;
}

interface ATSAnalysis {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  structureScore: number;
  contentScore: number;
  suggestions: string[];
  strengths: string[];
  warnings: string[];
}

interface OptimizationSuggestion {
  id: string;
  type: 'critical' | 'important' | 'minor';
  category: 'format' | 'content' | 'keywords' | 'structure';
  title: string;
  description: string;
  impact: number;
  selected: boolean;
  preview?: string;
}

const FixMyResumeNow: React.FC<FixMyResumeNowProps> = ({
  resumeData,
  currentUserId,
  isPremiumUser,
  currentSubscription,
  onApplyOptimizations,
  onExport,
  canExport
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [optimizations, setOptimizations] = useState<OptimizationSuggestion[]>([]);
  const [usageData, setUsageData] = useState({ fix_used_count: 0, export_count: 0 });
  const [showOptimizations, setShowOptimizations] = useState(false);
  const { toast } = useToast();

  // Check if user can use fix feature
  const canUseFix = () => {
    if (!currentSubscription) return false;
    
    switch (currentSubscription.tier) {
      case 'unlimited':
        return true;
      case 'premium':
        return usageData.fix_used_count < 3;
      case 'basic':
        return usageData.fix_used_count < 1;
      default:
        return false;
    }
  };

  const getFixLimit = () => {
    if (!currentSubscription) return 0;
    
    switch (currentSubscription.tier) {
      case 'unlimited':
        return 999;
      case 'premium':
        return 3;
      case 'basic':
        return 1;
      default:
        return 0;
    }
  };

  // Load usage data
  useEffect(() => {
    const loadUsageData = async () => {
      if (!currentUserId) return;
      
      try {
        const { data, error } = await supabase
          .from('resume_fix_usage')
          .select('fix_used_count, export_count')
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        if (!error && data) {
          setUsageData(data);
        }
      } catch (error) {
        console.error('Error loading usage data:', error);
      }
    };
    
    loadUsageData();
  }, [currentUserId]);

  // Calculate ATS score
  const calculateATSScore = (data: any): ATSAnalysis => {
    let formatScore = 100; // Perfect format since it's our template
    let keywordScore = 50;
    let structureScore = 0;
    let contentScore = 0;
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const warnings: string[] = [];

    // Structure analysis
    let structurePoints = 0;
    if (data.personalInfo?.name && data.personalInfo?.email && data.personalInfo?.phone) {
      structurePoints += 25;
      strengths.push("Complete contact information");
    } else {
      suggestions.push("Add complete contact information");
    }

    if (data.summary && data.summary.length > 50) {
      structurePoints += 25;
      strengths.push("Professional summary included");
    } else {
      suggestions.push("Add a compelling professional summary");
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
    if (data.skills && data.skills.length >= 5) {
      contentPoints += 25;
      keywordScore += 20;
      strengths.push("Good variety of skills");
    } else {
      suggestions.push("Add more relevant skills");
    }

    if (data.workExperience?.some((exp: any) => exp.responsibilities && exp.responsibilities.length > 2)) {
      contentPoints += 25;
      keywordScore += 15;
      strengths.push("Detailed job responsibilities");
    } else {
      suggestions.push("Add detailed job descriptions");
    }

    const hasNumbers = [data.summary, ...(data.workExperience?.map((exp: any) => exp.responsibilities?.join(' ')) || [])]
      .join(' ')
      .match(/\d+%|\d+\+|\$\d+|\d+ years?/gi);

    if (hasNumbers && hasNumbers.length > 0) {
      contentPoints += 25;
      keywordScore += 15;
      strengths.push("Quantifiable achievements included");
    } else {
      suggestions.push("Add quantifiable achievements with numbers");
    }

    contentScore = Math.min(contentPoints + 25, 100);
    keywordScore = Math.min(keywordScore, 100);

    // Warnings
    const contentText = [data.summary, ...(data.workExperience?.map((exp: any) => exp.responsibilities?.join(' ')) || [])].join(' ').toLowerCase();
    if (contentText.includes('responsible for')) {
      warnings.push("Avoid passive phrases - use action verbs");
    }

    const overallScore = Math.round((formatScore + keywordScore + structureScore + contentScore) / 4);

    return {
      overallScore,
      formatScore,
      keywordScore,
      structureScore,
      contentScore,
      suggestions,
      strengths,
      warnings
    };
  };

  // Generate optimization suggestions
  const generateOptimizations = (analysis: ATSAnalysis): OptimizationSuggestion[] => {
    const optimizations: OptimizationSuggestion[] = [];

    // Critical optimizations (score < 60)
    if (analysis.keywordScore < 60) {
      optimizations.push({
        id: 'keywords-critical',
        type: 'critical',
        category: 'keywords',
        title: 'Add Industry Keywords',
        description: 'Include relevant industry keywords and technical skills that ATS systems look for',
        impact: 25,
        selected: true,
        preview: 'Add keywords like "project management", "data analysis", "team leadership"'
      });
    }

    if (analysis.contentScore < 60) {
      optimizations.push({
        id: 'content-critical',
        type: 'critical',
        category: 'content',
        title: 'Enhance Content Quality',
        description: 'Improve job descriptions with quantifiable achievements and action verbs',
        impact: 20,
        selected: true,
        preview: 'Transform "Responsible for sales" to "Increased sales by 25% through strategic client outreach"'
      });
    }

    // Important optimizations (score < 80)
    if (analysis.structureScore < 80) {
      optimizations.push({
        id: 'structure-important',
        type: 'important',
        category: 'structure',
        title: 'Complete Profile Sections',
        description: 'Fill in missing sections to create a comprehensive resume profile',
        impact: 15,
        selected: true,
        preview: 'Add missing education, skills, or contact information'
      });
    }

    // Minor optimizations
    optimizations.push({
      id: 'format-minor',
      type: 'minor',
      category: 'format',
      title: 'Optimize Formatting',
      description: 'Improve section headers and bullet point consistency',
      impact: 10,
      selected: false,
      preview: 'Standardize date formats and bullet point styles'
    });

    if (!resumeData.summary || resumeData.summary.length < 100) {
      optimizations.push({
        id: 'summary-important',
        type: 'important',
        category: 'content',
        title: 'Professional Summary',
        description: 'Add a compelling professional summary that highlights your key strengths',
        impact: 18,
        selected: true,
        preview: 'Experienced [Your Role] with X years of expertise in [Key Skills]...'
      });
    }

    return optimizations.sort((a, b) => {
      const typeOrder = { critical: 3, important: 2, minor: 1 };
      return typeOrder[b.type] - typeOrder[a.type] || b.impact - a.impact;
    });
  };

  // Analyze resume
  const analyzeResume = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const analysis = calculateATSScore(resumeData);
      setAtsAnalysis(analysis);
      
      const suggestions = generateOptimizations(analysis);
      setOptimizations(suggestions);
      
      setShowOptimizations(true);
      
      toast({
        title: "Analysis Complete",
        description: `Your resume scored ${analysis.overallScore}%. Found ${suggestions.filter(s => s.type === 'critical').length} critical issues to fix.`,
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

  // Apply optimizations
  const applyOptimizations = async () => {
    if (!canUseFix()) {
      toast({
        title: "Upgrade Required",
        description: "You've reached your fix limit. Please upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    
    try {
      const selectedOptimizations = optimizations.filter(opt => opt.selected);
      
      // Simulate optimization processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Increment usage count
      await supabase.rpc('increment_resume_fix_usage', { user_uuid: currentUserId });
      
      // Apply optimizations to resume data
      onApplyOptimizations(selectedOptimizations);
      
      // Update usage data
      setUsageData(prev => ({ ...prev, fix_used_count: prev.fix_used_count + 1 }));
      
      toast({
        title: "Resume Optimized!",
        description: `Applied ${selectedOptimizations.length} optimizations. Your ATS score should improve significantly.`,
      });
      
      setShowOptimizations(false);
      
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'important': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'minor': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const toggleOptimization = (id: string) => {
    setOptimizations(prev => prev.map(opt => 
      opt.id === id ? { ...opt, selected: !opt.selected } : opt
    ));
  };

  if (!isPremiumUser) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Fix My Resume Now - Premium Feature
          </CardTitle>
          <CardDescription>
            Get instant ATS optimization and professional improvements for your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              This premium feature analyzes your resume and provides one-click optimizations to improve your ATS score and job prospects.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="font-semibold">ATS Score Boost</div>
              <div className="text-sm text-muted-foreground">+20-40 points average</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="font-semibold">Instant Fix</div>
              <div className="text-sm text-muted-foreground">One-click optimization</div>
            </div>
          </div>
          
          <LiveSubscriptionDialog>
            <Button className="w-full" size="lg">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Fix My Resume
            </Button>
          </LiveSubscriptionDialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Fix My Resume Now
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Premium
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered resume optimization with instant ATS improvements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Status */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">Fixes Used This Month</div>
            <div className="text-sm text-muted-foreground">
              {usageData.fix_used_count} of {getFixLimit()} {currentSubscription?.tier === 'unlimited' ? '(Unlimited)' : ''}
            </div>
          </div>
          <Progress 
            value={currentSubscription?.tier === 'unlimited' ? 100 : (usageData.fix_used_count / getFixLimit()) * 100} 
            className="w-24" 
          />
        </div>

        {!showOptimizations ? (
          <div className="space-y-4">
            {/* Quick ATS Preview */}
            {atsAnalysis && (
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Current ATS Score</h4>
                  <div className={`text-2xl font-bold ${getScoreColor(atsAnalysis.overallScore)}`}>
                    {atsAnalysis.overallScore}%
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center">
                    <div className={getScoreColor(atsAnalysis.formatScore)}>{atsAnalysis.formatScore}%</div>
                    <div className="text-muted-foreground">Format</div>
                  </div>
                  <div className="text-center">
                    <div className={getScoreColor(atsAnalysis.keywordScore)}>{atsAnalysis.keywordScore}%</div>
                    <div className="text-muted-foreground">Keywords</div>
                  </div>
                  <div className="text-center">
                    <div className={getScoreColor(atsAnalysis.structureScore)}>{atsAnalysis.structureScore}%</div>
                    <div className="text-muted-foreground">Structure</div>
                  </div>
                  <div className="text-center">
                    <div className={getScoreColor(atsAnalysis.contentScore)}>{atsAnalysis.contentScore}%</div>
                    <div className="text-muted-foreground">Content</div>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={analyzeResume}
              disabled={isAnalyzing || !canUseFix()}
              className="w-full"
              size="lg"
            >
              <Zap className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing Resume..." : "Analyze & Fix My Resume"}
            </Button>

            {!canUseFix() && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You've reached your monthly fix limit. Upgrade to continue optimizing your resume.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Score Display */}
            {atsAnalysis && (
              <div className="text-center p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Current ATS Score</div>
                <div className={`text-3xl font-bold ${getScoreColor(atsAnalysis.overallScore)}`}>
                  {atsAnalysis.overallScore}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {atsAnalysis.overallScore >= 80 ? 'Excellent' : 
                   atsAnalysis.overallScore >= 60 ? 'Good - Room for improvement' : 
                   'Needs optimization'}
                </div>
              </div>
            )}

            {/* Optimization Suggestions */}
            <div>
              <h4 className="font-medium mb-3">Recommended Optimizations</h4>
              <div className="space-y-3">
                {optimizations.map((opt) => (
                  <div 
                    key={opt.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      opt.selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleOptimization(opt.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={opt.selected}
                        onChange={() => toggleOptimization(opt.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getOptimizationIcon(opt.type)}
                          <span className="font-medium">{opt.title}</span>
                          <Badge variant="outline" className="text-xs">
                            +{opt.impact} pts
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {opt.description}
                        </p>
                        {opt.preview && (
                          <div className="text-xs p-2 bg-gray-100 rounded italic">
                            Example: {opt.preview}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projected Score */}
            {atsAnalysis && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-green-800">Projected New Score</div>
                    <div className="text-sm text-green-600">
                      After applying {optimizations.filter(o => o.selected).length} optimizations
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.min(atsAnalysis.overallScore + optimizations.filter(o => o.selected).reduce((sum, o) => sum + o.impact, 0), 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={applyOptimizations}
                disabled={isOptimizing || optimizations.filter(o => o.selected).length === 0}
                className="flex-1"
                size="lg"
              >
                <Zap className="mr-2 h-4 w-4" />
                {isOptimizing ? "Optimizing..." : "Apply Optimizations"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowOptimizations(false)}
                disabled={isOptimizing}
              >
                Back
              </Button>
            </div>

            {/* Export Options */}
            <div className="border-t pt-4">
              <h5 className="font-medium mb-2">Export Optimized Resume</h5>
              <div className="flex gap-2">
                {canExport ? (
                  <Button onClick={onExport} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                ) : (
                  <LiveSubscriptionDialog>
                    <Button variant="outline" className="flex-1">
                      <Crown className="mr-2 h-4 w-4" />
                      Export PDF
                    </Button>
                  </LiveSubscriptionDialog>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FixMyResumeNow;
