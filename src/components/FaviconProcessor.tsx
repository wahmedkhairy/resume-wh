
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';

const FaviconProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const processFavicon = async () => {
    setIsProcessing(true);
    try {
      // Load the current favicon
      const response = await fetch('/lovable-uploads/fd4db92c-23f8-47a8-a316-dd7120358aa6.png');
      const blob = await response.blob();
      
      // Load as image element
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for preview
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
      toast({
        title: "Background removed successfully!",
        description: "Your favicon now has a transparent background. Click download to save it.",
      });
    } catch (error) {
      console.error('Error processing favicon:', error);
      toast({
        title: "Error processing image",
        description: "Failed to remove background. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'favicon-transparent.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Favicon Background Remover
        </CardTitle>
        <CardDescription>
          Remove the white background from your favicon to make it transparent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <img 
            src="/lovable-uploads/fd4db92c-23f8-47a8-a316-dd7120358aa6.png" 
            alt="Original favicon"
            className="w-16 h-16 mx-auto mb-2 border rounded"
          />
          <p className="text-sm text-gray-600">Current favicon</p>
        </div>

        <Button 
          onClick={processFavicon}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : 'Remove Background'}
        </Button>

        {processedImage && (
          <div className="space-y-4">
            <div className="text-center">
              <img 
                src={processedImage} 
                alt="Processed favicon"
                className="w-16 h-16 mx-auto mb-2 border rounded"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              />
              <p className="text-sm text-gray-600">Transparent background</p>
            </div>
            
            <Button 
              onClick={downloadProcessedImage}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Transparent Favicon
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaviconProcessor;
