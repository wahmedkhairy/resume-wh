
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, FileText, Crown } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SubscriptionDialog from "./SubscriptionDialog";

interface ExportControlsProps {
  onSave: () => void;
  onExport: () => void;
  onExportWord?: () => void;
  isSaving: boolean;
  isExporting: boolean;
  currentUserId: string;
  isPremiumUser: boolean;
  isTailoredResume?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onSave,
  onExport,
  onExportWord,
  isSaving,
  isExporting,
  currentUserId,
  isPremiumUser,
  isTailoredResume = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handlePDFExport = () => {
    if (isTailoredResume && !isPremiumUser) {
      return; // Prevent export for tailored resumes if not premium
    }
    onExport();
    setDropdownOpen(false);
  };

  const handleWordExport = () => {
    if (isTailoredResume && !isPremiumUser) {
      return; // Prevent export for tailored resumes if not premium
    }
    if (onExportWord) {
      onExportWord();
    }
    setDropdownOpen(false);
  };

  const canExport = isPremiumUser || !isTailoredResume;

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {isTailoredResume ? "Tailored Resume Preview" : "ATS Resume Editor"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isTailoredResume ? "Your customized resume for the job" : "Professional resume template"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onSave}
            disabled={isSaving}
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          
          {canExport ? (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting}>
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? "Exporting..." : "Export Resume"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePDFExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWordExport}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as Word (.DOCX)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SubscriptionDialog>
              <Button className="opacity-75">
                <Crown className="mr-2 h-4 w-4" />
                🔒 Export Resume
              </Button>
            </SubscriptionDialog>
          )}
        </div>
      </div>

      {isTailoredResume && !isPremiumUser && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>Upgrade to a paid plan to export your tailored resume as PDF or Word document.</span>
              <SubscriptionDialog>
                <Button variant="outline" size="sm" className="ml-4">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </SubscriptionDialog>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExportControls;
