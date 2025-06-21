
import React from "react";
import ResumePreview from "@/components/ResumePreview";
import ATSScanner from "@/components/ATSScanner";
import AntiTheftProtection from "@/components/AntiTheftProtection";
import { PersonalInfo } from "@/components/PersonalInfoBar";
import { Button } from "@/components/ui/button";
import { Download, FileText, Crown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LiveSubscriptionDialog from "@/components/LiveSubscriptionDialog";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: string;
  name: string;
  level: number;
}

interface Course {
  id: string;
  title: string;
  provider: string;
  date: string;
  description: string;
  type: "course" | "certification";
}

interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  responsibilities: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  gpa?: string;
  location: string;
}

interface PreviewSectionProps {
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  coursesAndCertifications: Course[];
  onSummaryChange: (summary: string) => void;
  isPremiumUser: boolean;
  currentUserId: string;
  sessionId: string;
  onExport?: () => void;
  onExportWord?: () => void;
  isExporting?: boolean;
  canExport?: boolean;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  personalInfo,
  summary,
  workExperience,
  education,
  skills,
  coursesAndCertifications,
  onSummaryChange,
  isPremiumUser,
  currentUserId,
  sessionId,
  onExport,
  onExportWord,
  isExporting = false,
  canExport = false,
}) => {
  const { toast } = useToast();

  // Prepare resume data for ATS Scanner and export
  const resumeData = {
    personalInfo,
    summary,
    workExperience,
    education,
    skills,
    coursesAndCertifications,
  };

  const handleExportClick = async () => {
    console.log('=== PreviewSection Export PDF Button Clicked ===');
    console.log('canExport:', canExport);
    console.log('onExport function available:', !!onExport);
    console.log('isExporting:', isExporting);
    
    // Prevent multiple export attempts
    if (isExporting) {
      console.log('Export already in progress, ignoring click');
      return;
    }

    if (!canExport) {
      console.log('Export not allowed - showing upgrade message');
      toast({
        title: "Export Not Available",
        description: "Please upgrade to export your resume.",
        variant: "destructive",
      });
      return;
    }

    if (!onExport) {
      console.log('onExport function not available');
      toast({
        title: "Export Error",
        description: "Export function not available. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting export process...');
      await onExport();
    } catch (error) {
      console.error('Export failed in PreviewSection:', error);
      toast({
        title: "Export Failed", 
        description: error instanceof Error ? error.message : "There was an error exporting your resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWordExportClick = async () => {
    console.log('=== PreviewSection Export Word Button Clicked ===');
    console.log('canExport:', canExport);
    console.log('onExportWord function available:', !!onExportWord);
    console.log('isExporting:', isExporting);
    
    // Prevent multiple export attempts
    if (isExporting) {
      console.log('Word export already in progress, ignoring click');
      return;
    }

    if (!canExport) {
      console.log('Word export not allowed - showing upgrade message');
      toast({
        title: "Export Not Available",
        description: "Please upgrade to export your resume.",
        variant: "destructive",
      });
      return;
    }

    if (!onExportWord) {
      console.log('onExportWord function not available');
      toast({
        title: "Export Error",
        description: "Word export function not available. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting Word export process...');
      await onExportWord();
    } catch (error) {
      console.error('Word export failed in PreviewSection:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "There was an error exporting your resume as Word. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Resume Preview</h2>
          
          {/* Export Controls */}
          <div className="flex justify-end">
            {canExport ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={isExporting} size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? "Exporting..." : "Export Resume"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportClick} disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleWordExportClick} disabled={isExporting}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Word (.DOCX)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LiveSubscriptionDialog>
                <Button size="sm">
                  <Crown className="mr-2 h-4 w-4" />
                  Export Resume
                </Button>
              </LiveSubscriptionDialog>
            )}
          </div>
        </div>
        
        <div className="border rounded-lg bg-white relative" data-resume-preview>
          <ResumePreview 
            watermark={!isPremiumUser}
            personalInfo={personalInfo}
            summary={summary}
            workExperience={workExperience}
            education={education}
            skills={skills}
            coursesAndCertifications={coursesAndCertifications}
            onSummaryChange={onSummaryChange}
          />
          <AntiTheftProtection 
            isActive={!isPremiumUser}
            userId={currentUserId}
            sessionId={sessionId}
          />
        </div>
      </div>
      
      <ATSScanner resumeData={resumeData} />
    </div>
  );
};

export default PreviewSection;
