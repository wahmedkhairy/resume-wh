
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Save, FileText } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportControlsProps {
  onSave: () => void;
  onExport: () => void;
  onExportText?: () => void;
  isSaving: boolean;
  isExporting: boolean;
  currentUserId: string;
  isPremiumUser: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onSave,
  onExport,
  onExportText,
  isSaving,
  isExporting,
  currentUserId,
  isPremiumUser,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handlePDFExport = () => {
    onExport();
    setDropdownOpen(false);
  };

  const handleTextExport = () => {
    if (onExportText) {
      onExportText();
    }
    setDropdownOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold">ATS-Pro Resume Editor</h2>
        <p className="text-sm text-muted-foreground">100% ATS-compliant formatting</p>
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
        
        {isPremiumUser ? (
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
              <DropdownMenuItem onClick={handleTextExport}>
                <FileText className="mr-2 h-4 w-4" />
                Export as Plain Text (.TXT)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            disabled={true}
            className="opacity-50 cursor-not-allowed"
          >
            <Download className="mr-2 h-4 w-4" />
            🔒 Export Resume
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExportControls;
