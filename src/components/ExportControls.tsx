
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";

interface ExportControlsProps {
  onSave: () => void;
  onExport: () => void;
  isSaving: boolean;
  isExporting: boolean;
  currentUserId: string;
  isPremiumUser: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onSave,
  onExport,
  isSaving,
  isExporting,
  currentUserId,
  isPremiumUser,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
      <h2 className="text-xl font-bold">Resume Editor</h2>
      <div className="flex gap-2">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          variant="outline"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button 
          onClick={onExport}
          disabled={isExporting || (!isPremiumUser)}
          className={`${!isPremiumUser ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : isPremiumUser ? "Export Resume" : "🔒 Export Resume"}
        </Button>
      </div>
    </div>
  );
};

export default ExportControls;
