
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, Save } from "lucide-react";
import SubscriptionStatus from "@/components/SubscriptionStatus";

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
      <SubscriptionStatus remainingExports={remainingExports} />
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onSave}
              disabled={isSaving || isTailoredResume}
              variant="outline"
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Resume"}
            </Button>
            
            <Button
              onClick={onExport}
              disabled={isExporting || !canExport}
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
            
            <Button
              onClick={onExportWord}
              disabled={isExporting || !canExport}
              variant="outline"
              size="sm"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Word"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportControls;
