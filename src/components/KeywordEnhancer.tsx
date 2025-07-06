
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface KeywordEnhancerProps {
  originalText: string;
  onEnhancedText: (enhancedText: string) => void;
  placeholder?: string;
  title?: string;
}

const KeywordEnhancer: React.FC<KeywordEnhancerProps> = ({
  originalText,
  onEnhancedText,
  placeholder = "Enter text to enhance with better keywords...",
  title = "AI Keyword Enhancement"
}) => {
  const [enhancedText, setEnhancedText] = useState("");
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  const enhanceWithKeywords = async () => {
    if (!originalText.trim()) {
      toast({
        title: "No Text to Enhance",
        description: "Please provide text to enhance with keywords.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-keywords', {
        body: { 
          text: originalText,
          context: "professional resume"
        }
      });

      if (error) {
        throw error;
      }

      if (data?.enhancedText) {
        setEnhancedText(data.enhancedText);
        setSuggestedKeywords(data.keywords || []);
        toast({
          title: "Text Enhanced!",
          description: "Your text has been enhanced with relevant keywords.",
        });
      }
    } catch (error) {
      console.error('Keyword enhancement error:', error);
      // Fallback enhancement
      const fallbackEnhanced = enhanceTextFallback(originalText);
      setEnhancedText(fallbackEnhanced.text);
      setSuggestedKeywords(fallbackEnhanced.keywords);
      
      toast({
        title: "Text Enhanced",
        description: "Enhanced using built-in optimization.",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const enhanceTextFallback = (text: string) => {
    const industryKeywords = [
      'strategic', 'innovative', 'efficient', 'collaborative', 'results-driven',
      'analytical', 'detail-oriented', 'problem-solving', 'leadership', 'communication',
      'project management', 'cross-functional', 'data-driven', 'optimization',
      'stakeholder management', 'performance improvement', 'best practices'
    ];

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const enhancedSentences = sentences.map(sentence => {
      let enhanced = sentence.trim();
      
      // Add strategic keywords
      if (enhanced.toLowerCase().includes('manage') && !enhanced.toLowerCase().includes('strategic')) {
        enhanced = enhanced.replace(/manage/gi, 'strategically manage');
      }
      if (enhanced.toLowerCase().includes('develop') && !enhanced.toLowerCase().includes('innovative')) {
        enhanced = enhanced.replace(/develop/gi, 'innovatively develop');
      }
      if (enhanced.toLowerCase().includes('work') && !enhanced.toLowerCase().includes('collaborate')) {
        enhanced = enhanced.replace(/work with/gi, 'collaborate with');
      }
      
      return enhanced;
    });

    return {
      text: enhancedSentences.join('. ') + (text.endsWith('.') ? '' : '.'),
      keywords: industryKeywords.slice(0, 8)
    };
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Enhanced text copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const applyEnhancement = () => {
    if (enhancedText) {
      onEnhancedText(enhancedText);
      toast({
        title: "Enhancement Applied",
        description: "Your text has been updated with the enhanced version.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Enhance your text with industry-relevant keywords and professional language
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Original Text</label>
          <Textarea
            value={originalText}
            readOnly
            placeholder={placeholder}
            className="min-h-[100px] bg-gray-50"
          />
        </div>

        <Button 
          onClick={enhanceWithKeywords}
          disabled={isEnhancing || !originalText.trim()}
          className="w-full"
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {isEnhancing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            'Enhance with Keywords'
          )}
        </Button>

        {enhancedText && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-green-700">Enhanced Text</label>
              <Textarea
                value={enhancedText}
                onChange={(e) => setEnhancedText(e.target.value)}
                className="min-h-[120px] border-green-200 focus:border-green-400"
              />
            </div>

            {suggestedKeywords.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Added Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={applyEnhancement}
                className="flex-1"
              >
                Apply Enhancement
              </Button>
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(enhancedText)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordEnhancer;
