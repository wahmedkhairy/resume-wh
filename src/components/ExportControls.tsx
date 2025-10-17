
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Download, FileText } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LiveSubscriptionDialog from "@/components/LiveSubscriptionDialog";
import { useToast } from "@/hooks/use-toast";

interface ExportControlsProps {
  onSave: () => void;
  isSaving: boolean;
  isTailoredResume?: boolean;
  onExport?: () => void;
  onExportWord?: () => void;
  isExporting?: boolean;
  canExport?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onSave,
  isSaving,
  isTailoredResume = false,
  onExport,
  onExportWord,
  isExporting = false,
  canExport = false,
}) => {
  const { toast } = useToast();

  const handleExportClick = async () => {
    if (isExporting || !canExport || !onExport) {
      if (!canExport) {
        toast({
          title: "Export Not Available",
          description: "Please upgrade to export your resume.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      await onExport();
    } catch (error) {
      toast({
        title: "Export Failed", 
        description: "There was an error exporting your resume.",
        variant: "destructive",
      });
    }
  };

  const handleWordExportClick = async () => {
    if (isExporting || !canExport || !onExportWord) {
      if (!canExport) {
        toast({
          title: "Export Not Available",
          description: "Please upgrade to export your resume.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      await onExportWord();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume as Word.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">
            {isTailoredResume ? "Targeted Resume Editor" : "ATS Resume Editor"}
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
          
          {/* Export Controls */}
          {canExport ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isExporting}>
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
              <Button>
                Export Resume
              </Button>
            </LiveSubscriptionDialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
