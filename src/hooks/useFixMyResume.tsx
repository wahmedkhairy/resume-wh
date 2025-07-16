
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

export const useFixMyResume = (currentUserId: string) => {
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const { toast } = useToast();

  const applyOptimizationsToResume = useCallback((
    currentResumeData: any,
    optimizations: OptimizationSuggestion[]
  ) => {
    const optimizedData = { ...currentResumeData };

    optimizations.forEach(opt => {
      if (!opt.selected) return;

      switch (opt.category) {
        case 'keywords':
          // Enhance skills with industry keywords
          if (optimizedData.skills) {
            const industryKeywords = ['Leadership', 'Project Management', 'Data Analysis', 'Strategic Planning', 'Team Collaboration'];
            const newKeywords = industryKeywords.filter(keyword => 
              !optimizedData.skills.some((skill: any) => 
                skill.name.toLowerCase().includes(keyword.toLowerCase())
              )
            ).slice(0, 3);
            
            newKeywords.forEach(keyword => {
              optimizedData.skills.push({
                id: `auto-${Date.now()}-${keyword}`,
                name: keyword,
                level: 4
              });
            });
          }
          break;

        case 'content':
          // Enhance job descriptions with action verbs and quantifiable achievements
          if (optimizedData.workExperience) {
            optimizedData.workExperience = optimizedData.workExperience.map((exp: any) => {
              if (exp.responsibilities && exp.responsibilities.length > 0) {
                const enhancedResponsibilities = exp.responsibilities.map((resp: string) => {
                  if (resp.toLowerCase().startsWith('responsible for')) {
                    return resp.replace(/^responsible for/i, 'Led and managed');
                  }
                  if (!resp.match(/\d+%|\d+\+|\$\d+/)) {
                    // Add quantifiable elements where missing
                    if (resp.toLowerCase().includes('manage') || resp.toLowerCase().includes('lead')) {
                      return `${resp} (improved efficiency by 15-25%)`;
                    }
                    if (resp.toLowerCase().includes('develop') || resp.toLowerCase().includes('create')) {
                      return `${resp} (resulting in enhanced workflow and productivity)`;
                    }
                  }
                  return resp;
                });
                
                return { ...exp, responsibilities: enhancedResponsibilities };
              }
              return exp;
            });
          }
          break;

        case 'structure':
          // Ensure all sections are properly filled
          if (!optimizedData.summary || optimizedData.summary.length < 50) {
            const jobTitle = optimizedData.personalInfo?.jobTitle || 'Professional';
            optimizedData.summary = `Experienced ${jobTitle} with proven expertise in delivering high-quality results and driving organizational success. Skilled in problem-solving, team collaboration, and strategic planning. Committed to continuous learning and professional development while contributing to team objectives and company growth.`;
          }
          break;

        case 'format':
          // Standardize formatting (this would be handled in the template)
          break;
      }
    });

    return optimizedData;
  }, []);

  const handleApplyOptimizations = useCallback(async (
    optimizations: OptimizationSuggestion[],
    onUpdate: (data: any) => void,
    getCurrentData: () => any
  ) => {
    setIsApplyingFix(true);
    
    try {
      const currentData = getCurrentData();
      const optimizedData = applyOptimizationsToResume(currentData, optimizations);
      
      // Apply the optimized data
      onUpdate(optimizedData);
      
      toast({
        title: "Resume Optimized!",
        description: `Applied ${optimizations.filter(o => o.selected).length} optimizations successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error applying optimizations:', error);
      toast({
        title: "Optimization Failed",
        description: "There was an error applying the optimizations. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsApplyingFix(false);
    }
  }, [applyOptimizationsToResume, toast]);

  return {
    isApplyingFix,
    handleApplyOptimizations,
    applyOptimizationsToResume
  };
};
