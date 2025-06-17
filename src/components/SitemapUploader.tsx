
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";

const SitemapUploader: React.FC = () => {
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
        throw new Error('Invalid sitemap format');
      }

      // In a real application, you would upload this to your server
      // For now, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      setUploadStatus('success');
      toast({
        title: "Sitemap Uploaded Successfully",
        description: "Your sitemap.xml has been updated and will be deployed with your next build.",
      });
      
      console.log('Sitemap content:', fileContent);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your sitemap. Please try again.",
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
    const fileInput = document.getElementById('sitemap-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Sitemap Management
        </CardTitle>
        <CardDescription>
          Upload and manage your sitemap.xml file for better search engine optimization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sitemap-file">Select Sitemap File</Label>
          <Input
            id="sitemap-file"
            type="file"
            accept=".xml,text/xml,application/xml"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <p className="text-sm text-muted-foreground">
            Accepted formats: .xml files only (max 1MB)
          </p>
        </div>

        {selectedFile && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{selectedFile.name}</span>
              <span className="text-sm text-muted-foreground">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg">
            <Check className="h-4 w-4" />
            <span className="text-sm">Sitemap uploaded successfully!</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Upload failed. Please try again.</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Sitemap"}
          </Button>
          
          {(selectedFile || uploadStatus !== 'idle') && (
            <Button
              variant="outline"
              onClick={resetUpload}
              disabled={isUploading}
            >
              Reset
            </Button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Current Sitemap</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
            Your current sitemap includes the following pages:
          </p>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>• Home page (/)</li>
            <li>• Authentication (/auth)</li>
            <li>• Payment success (/payment-success)</li>
            <li>• Payment cancelled (/payment-cancelled)</li>
            <li>• Admin panel (/admin)</li>
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Remember to update "yourdomain.com" with your actual domain name in the sitemap.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SitemapUploader;
