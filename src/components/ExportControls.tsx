
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface ExportControlsProps {
  onSave: () => void;
  isSaving: boolean;
  isTailoredResume?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  onSave,
  isSaving,
  isTailoredResume = false,
}) => {
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
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
