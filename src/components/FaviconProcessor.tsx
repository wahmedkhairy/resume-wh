
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Settings, Package } from 'lucide-react';

const FaviconProcessor: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number>(32);
  const { toast } = useToast();

  // Common favicon sizes with recommendations
  const faviconSizes = [
    { size: 16, label: '16×16px (Small)', description: 'Browser tabs' },
    { size: 32, label: '32×32px (Recommended)', description: 'Standard favicon' },
    { size: 48, label: '48×48px (Large)', description: 'High-DPI displays' },
    { size: 64, label: '64×64px (Extra Large)', description: 'Bookmarks' }
  ];

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
      
      // Resize to selected size with proper optimization
      const optimizedBlob = await resizeAndOptimizeFavicon(processedBlob, selectedSize);
      
      // Create URL for preview
      const processedUrl = URL.createObjectURL(optimizedBlob);
      setProcessedImage(processedUrl);
      
      toast({
        title: "Favicon optimized successfully!",
        description: `Background removed and resized to ${selectedSize}×${selectedSize}px for optimal browser display.`,
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

  const resizeAndOptimizeFavicon = async (blob: Blob, targetSize: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      
      img.onload = () => {
        // Set canvas size
        canvas.width = targetSize;
        canvas.height = targetSize;
        
        // Configure high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Calculate scaling to maintain aspect ratio while filling the square
        const scale = Math.min(targetSize / img.width, targetSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const x = (targetSize - scaledWidth) / 2;
        const y = (targetSize - scaledHeight) / 2;
        
        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, targetSize, targetSize);
        
        // Draw the resized image
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert to blob with high quality
        canvas.toBlob((optimizedBlob) => {
          if (optimizedBlob) {
            resolve(optimizedBlob);
          } else {
            reject(new Error('Failed to create optimized blob'));
          }
        }, 'image/png', 1.0);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  };

  const downloadProcessedImage = () => {
    if (processedImage) {
      try {
        const link = document.createElement('a');
        link.href = processedImage;
        link.download = `favicon-${selectedSize}x${selectedSize}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        toast({
          title: "Download started!",
          description: `Favicon downloaded as favicon-${selectedSize}x${selectedSize}.png`,
        });
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Download failed",
          description: "Please try again or right-click the image to save.",
          variant: "destructive",
        });
      }
    }
  };

  const generateFaviconPack = async () => {
    if (!processedImage) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      
      // Generate different sizes
      const sizes = [16, 32, 48, 64];
      const generatedFiles: { size: number, blob: Blob }[] = [];
      
      for (const size of sizes) {
        const resizedBlob = await resizeAndOptimizeFavicon(blob, size);
        generatedFiles.push({ size, blob: resizedBlob });
      }
      
      // Download each file
      for (const file of generatedFiles) {
        const url = URL.createObjectURL(file.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `favicon-${file.size}x${file.size}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100 * file.size); // Stagger the downloads
      }
      
      toast({
        title: "Favicon pack generated!",
        description: "Multiple sizes downloaded. Check your downloads folder.",
      });
    } catch (error) {
      console.error('Error generating favicon pack:', error);
      toast({
        title: "Error generating pack",
        description: "Failed to generate favicon pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Favicon Optimizer
        </CardTitle>
        <CardDescription>
          Remove background and optimize your favicon size for perfect browser display
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
            Target Size
          </label>
          <select 
            value={selectedSize} 
            onChange={(e) => setSelectedSize(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-white"
          >
            {faviconSizes.map(({ size, label, description }) => (
              <option key={size} value={size}>
                {label} - {description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            32×32px is recommended for optimal visibility in browser tabs
          </p>
        </div>

        <Button 
          onClick={processFavicon}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : `Optimize to ${selectedSize}×${selectedSize}px`}
        </Button>

        {processedImage && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg inline-block">
                <img 
                  src={processedImage} 
                  alt="Optimized favicon"
                  className="mx-auto mb-2 border rounded"
                  style={{ 
                    width: `${Math.min(selectedSize, 64)}px`, 
                    height: `${Math.min(selectedSize, 64)}px`,
                    imageRendering: selectedSize <= 32 ? 'pixelated' : 'auto'
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
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
                onClick={generateFaviconPack}
                variant="outline"
                className="flex-1 flex items-center gap-2"
                disabled={isProcessing}
              >
                <Package className="h-4 w-4" />
                Full Pack
              </Button>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-2">📋 HTML Implementation:</h4>
              <div className="bg-white p-2 rounded border text-xs font-mono overflow-x-auto">
                {`<link rel="icon" type="image/png" sizes="${selectedSize}x${selectedSize}" href="/favicon-${selectedSize}x${selectedSize}.png">
<link rel="shortcut icon" href="/favicon.ico">
<link rel="apple-touch-icon" sizes="${selectedSize}x${selectedSize}" href="/favicon-${selectedSize}x${selectedSize}.png">`}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Add this to your HTML &lt;head&gt; section and clear browser cache
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FaviconProcessor;