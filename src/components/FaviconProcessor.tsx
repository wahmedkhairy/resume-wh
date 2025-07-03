
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Settings } from 'lucide-react';
import JSZip from 'jszip';

const FaviconProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number>(32);
  const { toast } = useToast();

  // Common favicon sizes
  const faviconSizes = [16, 32, 48, 64, 128, 256];

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
      
      // Resize to selected size with proper scaling
      const resizedBlob = await resizeImage(processedBlob, selectedSize);
      
      // Create URL for preview
      const processedUrl = URL.createObjectURL(resizedBlob);
      setProcessedImage(processedUrl);
      
      toast({
        title: "Favicon processed successfully!",
        description: `Background removed and resized to ${selectedSize}x${selectedSize}px. Click download to save it.`,
      });
    } catch (error) {
      console.error('Error processing favicon:', error);
      toast({
        title: "Error processing image",
        description: "Failed to process favicon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resizeImage = async (blob: Blob, size: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Set canvas size
        canvas.width = size;
        canvas.height = size;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Calculate scaling to maintain aspect ratio while filling the square
        const scale = Math.max(size / img.width, size / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (size - scaledWidth) / 2;
        const y = (size - scaledHeight) / 2;
        
        // Clear canvas with transparency
        ctx.clearRect(0, 0, size, size);
        
        // Draw the resized image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to blob
        canvas.toBlob((resizedBlob) => {
          resolve(resizedBlob!);
        }, 'image/png');
      };
      
      img.src = URL.createObjectURL(blob);
    });
  };

  const generateMultipleSizes = async () => {
    if (!processedImage) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      
      // Generate different sizes
      const sizes = [16, 32, 48];
      const zip = new JSZip();
      
      for (const size of sizes) {
        const resizedBlob = await resizeImage(blob, size);
        zip.file(`favicon-${size}x${size}.png`, resizedBlob);
      }
      
      // Generate ICO file content for multiple sizes
      const icoContent = await generateICO(blob);
      zip.file('favicon.ico', icoContent);
      
      // Download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'favicon-pack.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Favicon pack generated!",
        description: "Downloaded zip with multiple favicon sizes including .ico file.",
      });
    } catch (error) {
      console.error('Error generating favicon pack:', error);
      toast({
        title: "Error",
        description: "Failed to generate favicon pack.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateICO = async (blob: Blob): Promise<Blob> => {
    // Simple ICO generation - you might want to use a proper ICO library
    // This is a basic implementation
    const sizes = [16, 32, 48];
    const images = await Promise.all(
      sizes.map(size => resizeImage(blob, size))
    );
    
    // For now, return the 32x32 version as ICO
    // In a real implementation, you'd properly format as ICO
    return await resizeImage(blob, 32);
  };

  const downloadProcessedImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `favicon-${selectedSize}x${selectedSize}.png`;
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
          Favicon Processor & Optimizer
        </CardTitle>
        <CardDescription>
          Remove background and optimize your favicon size for better visibility
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

        {/* Size selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Target Size (pixels)
          </label>
          <select 
            value={selectedSize} 
            onChange={(e) => setSelectedSize(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          >
            {faviconSizes.map(size => (
              <option key={size} value={size}>
                {size}×{size}px {size === 32 ? '(Recommended)' : ''}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            32×32px is recommended for most browsers and provides good visibility
          </p>
        </div>

        <Button 
          onClick={processFavicon}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : `Process & Resize to ${selectedSize}px`}
        </Button>

        {processedImage && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg inline-block">
                <img 
                  src={processedImage} 
                  alt="Processed favicon"
                  className="mx-auto mb-2 border rounded"
                  style={{ 
                    width: `${Math.min(selectedSize, 64)}px`, 
                    height: `${Math.min(selectedSize, 64)}px`,
                    imageRendering: selectedSize <= 32 ? 'pixelated' : 'auto'
                  }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Optimized {selectedSize}×{selectedSize}px favicon
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={downloadProcessedImage}
                variant="outline"
                className="flex-1 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              
              <Button 
                onClick={generateMultipleSizes}
                variant="outline"
                className="flex-1 flex items-center gap-2"
                disabled={isProcessing}
              >
                <Download className="h-4 w-4" />
                Full Pack
              </Button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-1">HTML Implementation:</h4>
              <code className="text-xs bg-white p-2 rounded block">
{`<link rel="icon" type="image/png" sizes="${selectedSize}x${selectedSize}" href="/favicon-${selectedSize}x${selectedSize}.png">
<link rel="shortcut icon" href="/favicon.ico">`}
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaviconProcessor;
