
import React from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

interface ExportControlsProps {
  onSave: () => void;
  isSaving: boolean;
  isTailoredResume: boolean;
  onExport: () => void;
  onExportWord: () => void;
  isExporting: boolean;
  canExport: boolean;
  remainingExports?: number;
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
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={onSave}
          disabled={isSaving || isTailoredResume}
          variant="outline"
          className="flex items-center gap-2"
        >
          📄 Save
        </Button>
        
        <Button
          onClick={onExport}
          disabled={isExporting || !canExport}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Crown className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export Resume"}
        </Button>
      </div>
      
      <div className="text-sm bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
        {remainingExports} exports remaining
      </div>
    </div>
  );
};

export default ExportControls;
