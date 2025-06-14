
import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

interface Keyword {
  text: string;
  matched: boolean;
}

const KeywordMatcher = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const extractKeywordsFromText = (text: string): string[] => {
    // Simple keyword extraction logic
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over', 'within', 'without', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'until', 'unless', 'since', 'while', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'whether', 'if', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'a', 'an', 'as', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'get', 'got', 'go', 'went', 'gone', 'make', 'made', 'take', 'took', 'taken', 'come', 'came', 'give', 'gave', 'given', 'see', 'saw', 'seen', 'know', 'knew', 'known', 'think', 'thought', 'look', 'looked', 'use', 'used', 'find', 'found', 'want', 'wanted', 'tell', 'told', 'ask', 'asked', 'work', 'worked', 'try', 'tried', 'need', 'needed', 'feel', 'felt', 'become', 'became', 'leave', 'left', 'put', 'say', 'said', 'show', 'showed', 'shown', 'hear', 'heard', 'let', 'move', 'moved', 'live', 'lived', 'believe', 'believed', 'hold', 'held', 'bring', 'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'achieve', 'achieved', 'level', 'help', 'helped', 'allow', 'allowed', 'add', 'added', 'spend', 'spent', 'grow', 'grew', 'grown', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'offer', 'offered', 'remember', 'remembered', 'love', 'loved', 'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'wait', 'waited', 'serve', 'served', 'die', 'died', 'send', 'sent', 'expect', 'expected', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'fallen', 'cut', 'kill', 'killed', 'remain', 'remained']);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));
    
    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top keywords (words that appear more than once or are longer than 4 characters)
    return Object.entries(wordCount)
      .filter(([word, count]) => count > 1 || word.length > 4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);
  };

  const checkKeywordMatch = (keyword: string): boolean => {
    // Simple mock logic - in a real app, this would check against the user's resume
    const commonResumeKeywords = ['react', 'javascript', 'typescript', 'frontend', 'development', 'agile', 'redux', 'next.js', 'api', 'node.js', 'html', 'css', 'git', 'testing', 'ui', 'ux'];
    return commonResumeKeywords.some(resumeKeyword => 
      keyword.includes(resumeKeyword) || resumeKeyword.includes(keyword)
    );
  };

  const handleExtractKeywords = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Empty Description",
        description: "Please paste a job description first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExtracting(true);
    
    // Simulate processing time
    setTimeout(() => {
      const extractedKeywords = extractKeywordsFromText(jobDescription);
      const keywordsWithMatches = extractedKeywords.map(keyword => ({
        text: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        matched: checkKeywordMatch(keyword)
      }));
      
      setKeywords(keywordsWithMatches);
      setIsExtracting(false);
      
      const matchedCount = keywordsWithMatches.filter(k => k.matched).length;
      
      toast({
        title: "Keywords Extracted",
        description: `Found ${keywordsWithMatches.length} keywords, ${matchedCount} already in your resume.`,
      });
    }, 1500);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Job Description Analysis</CardTitle>
        <CardDescription>
          Paste a job description to extract keywords and optimize your resume
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste job description here..."
          className="min-h-[120px]"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        
        {keywords.length > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-medium mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge 
                  key={index}
                  variant={keyword.matched ? "default" : "outline"}
                  className={keyword.matched ? "bg-resume-success/20 text-resume-success border-resume-success/30" : ""}
                >
                  {keyword.text}
                  {keyword.matched && <CheckIcon className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleExtractKeywords} disabled={isExtracting}>
          <Search className="mr-2 h-4 w-4" />
          {isExtracting ? "Extracting..." : "Extract Keywords"}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default KeywordMatcher;
