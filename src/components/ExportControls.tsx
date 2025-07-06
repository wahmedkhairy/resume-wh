
import React from "react";
import { Button } from "@/components/ui/button";
import { Crown, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExportControlsProps {
  onSave: () => void;
  isSaving: boolean;
  isTailoredResume: boolean;
  onExport: () => void;
  onExportWord: () => void;
  isExporting: boolean;
  canExport: boolean;
  remainingExports?: number;
  isPremiumUser?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onSave,
  isSaving,
  isTailoredResume,
  onExport,
  onExportWord,
  isExporting,
  canExport,
  remainingExports = 0,
  isPremiumUser = false,
}) => {
  const navigate = useNavigate();

  const handleExportClick = () => {
    if (!isPremiumUser) {
      navigate('/subscription');
      return;
    }
    
    // For premium users, show export options
    if (canExport) {
      // Create a simple dropdown or modal for PDF/Word selection
      const choice = window.confirm("Choose export format:\nOK for PDF\nCancel for Word");
      if (choice) {
        onExport();
      } else {
        onExportWord();
      }
    }
  };

  return (
    <div className="flex gap-4 mb-6">
      <Button
        onClick={onSave}
        disabled={isSaving || isTailoredResume}
        variant="outline"
        className="flex items-center gap-2"
      >
        📄 {isSaving ? "Saving..." : "Save"}
      </Button>
      
      <Button
        onClick={handleExportClick}
        disabled={isExporting}
        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      >
        {isPremiumUser ? (
          <>
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Resume"}
          </>
        ) : (
          <>
            <Crown className="h-4 w-4" />
            Export Resume
          </>
        )}
      </Button>
      
      {isPremiumUser && (
        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center">
          {remainingExports} exports remaining
        </div>
      )}
    </div>
  );
};

export default ExportControls;
