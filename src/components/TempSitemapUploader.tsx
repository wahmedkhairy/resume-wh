import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react";

interface TempSitemapUploaderProps {
  onClose?: () => void;
}

const TempSitemapUploader: React.FC<TempSitemapUploaderProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xml') && file.type !== 'text/xml' && file.type !== 'application/xml') {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid XML file.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 1MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a sitemap.xml file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Read the file content
      const fileContent = await selectedFile.text();
      
      // Validate XML structure (basic check)
      if (!fileContent.includes('<?xml') || !fileContent.includes('<urlset')) {
        throw new Error('Invalid sitemap format - must be a valid XML sitemap');
      }

      // Validate that URLs look correct
      if (!fileContent.includes('<loc>') || !fileContent.includes('</loc>')) {
        throw new Error('Sitemap must contain valid URL entries with <loc> tags');
      }

      // Process the sitemap content
      console.log('Processing sitemap content:', fileContent);
      
      // Create a downloadable file with the processed content
      const blob = new Blob([fileContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sitemap.xml';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Extract URLs from the sitemap for display
      const urlMatches = fileContent.match(/<loc>(.*?)<\/loc>/g);
      const urls = urlMatches ? urlMatches.map(match => match.replace(/<\/?loc>/g, '')) : [];
      
      setUploadStatus('success');
      toast({
        title: "Sitemap Processed Successfully",
        description: `Found ${urls.length} URLs. File downloaded - replace your public/sitemap.xml and redeploy.`,
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error processing your sitemap. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    // Reset the file input
    const fileInput = document.getElementById('temp-sitemap-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Sitemap Uploader
            </CardTitle>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription className="text-sm">
            Upload your sitemap.xml file for processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="temp-sitemap-file" className="text-sm">Select Sitemap File</Label>
            <Input
              id="temp-sitemap-file"
              type="file"
              accept=".xml,text/xml,application/xml"
              onChange={handleFileSelect}
              disabled={isUploading}
              className="text-sm"
            />
          </div>

          {selectedFile && (
            <div className="p-2 bg-muted rounded text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                <span className="font-medium truncate">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-2 bg-green-50 text-green-800 rounded text-sm">
              <Check className="h-3 w-3" />
              <span>Sitemap processed successfully!</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-2 bg-red-50 text-red-800 rounded text-sm">
              <AlertCircle className="h-3 w-3" />
              <span>Upload failed. Please try again.</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-1 text-sm"
              size="sm"
            >
              <Upload className="h-3 w-3" />
              {isUploading ? "Processing..." : "Process Sitemap"}
            </Button>
            
            {(selectedFile || uploadStatus !== 'idle') && (
              <Button
                variant="outline"
                onClick={resetUpload}
                disabled={isUploading}
                size="sm"
                className="text-sm"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TempSitemapUploader;