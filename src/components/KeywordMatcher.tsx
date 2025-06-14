
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
import { Search, CheckCircle } from "lucide-react";

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
    // Enhanced keyword extraction logic
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over', 'within', 'without', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'until', 'unless', 'since', 'while', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'whether', 'if', 'that', 'this', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'a', 'an', 'as', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'get', 'got', 'go', 'went', 'gone', 'make', 'made', 'take', 'took', 'taken', 'come', 'came', 'give', 'gave', 'given', 'see', 'saw', 'seen', 'know', 'knew', 'known', 'think', 'thought', 'look', 'looked', 'use', 'used', 'find', 'found', 'want', 'wanted', 'tell', 'told', 'ask', 'asked', 'work', 'worked', 'try', 'tried', 'need', 'needed', 'feel', 'felt', 'become', 'became', 'leave', 'left', 'put', 'say', 'said', 'show', 'showed', 'shown', 'hear', 'heard', 'let', 'move', 'moved', 'live', 'lived', 'believe', 'believed', 'hold', 'held', 'bring', 'brought', 'happen', 'happened', 'write', 'wrote', 'written', 'sit', 'sat', 'stand', 'stood', 'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued', 'set', 'learn', 'learned', 'change', 'changed', 'lead', 'led', 'understand', 'understood', 'watch', 'watched', 'follow', 'followed', 'stop', 'stopped', 'create', 'created', 'speak', 'spoke', 'spoken', 'read', 'achieve', 'achieved', 'level', 'help', 'helped', 'allow', 'allowed', 'add', 'added', 'spend', 'spent', 'grow', 'grew', 'grown', 'open', 'opened', 'walk', 'walked', 'win', 'won', 'offer', 'offered', 'remember', 'remembered', 'love', 'loved', 'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'wait', 'waited', 'serve', 'served', 'die', 'died', 'send', 'sent', 'expect', 'expected', 'build', 'built', 'stay', 'stayed', 'fall', 'fell', 'fallen', 'cut', 'kill', 'killed', 'remain', 'remained']);
    
    // Extract multi-word technical terms and skills
    const technicalPatterns = [
      /\b(?:react|angular|vue|node\.?js|express|mongodb|postgresql|mysql|javascript|typescript|python|java|c\+\+|php|ruby|go|rust|kotlin|swift)\b/gi,
      /\b(?:aws|azure|gcp|docker|kubernetes|jenkins|git|github|gitlab|jira|agile|scrum|devops)\b/gi,
      /\b(?:machine learning|artificial intelligence|data science|web development|mobile development|full stack|front end|back end|ui\/ux|user experience|user interface)\b/gi,
      /\b(?:project management|team lead|software engineer|developer|architect|analyst|manager|director|senior|junior|lead)\b/gi
    ];
    
    const words = text.toLowerCase()
      .replace(/[^\w\s\.\+\#]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));
    
    // Extract technical terms using patterns
    const technicalTerms: string[] = [];
    technicalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        technicalTerms.push(...matches.map(match => match.toLowerCase()));
      }
    });
    
    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top keywords (words that appear more than once or are longer than 4 characters)
    const topWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 1 || word.length > 4)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
    
    // Combine technical terms and top words, remove duplicates
    const allKeywords = [...new Set([...technicalTerms, ...topWords])];
    
    return allKeywords.slice(0, 15);
  };

  const checkKeywordMatch = (keyword: string): boolean => {
    // Enhanced mock logic - in a real app, this would check against the user's resume
    const commonResumeKeywords = [
      'react', 'javascript', 'typescript', 'frontend', 'development', 'agile', 'redux', 
      'next.js', 'api', 'node.js', 'html', 'css', 'git', 'testing', 'ui', 'ux',
      'python', 'java', 'aws', 'docker', 'mongodb', 'postgresql', 'express',
      'project management', 'team lead', 'full stack', 'mobile development',
      'machine learning', 'data science', 'devops', 'kubernetes', 'jenkins'
    ];
    
    return commonResumeKeywords.some(resumeKeyword => 
      keyword.toLowerCase().includes(resumeKeyword.toLowerCase()) || 
      resumeKeyword.toLowerCase().includes(keyword.toLowerCase())
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
                  className={keyword.matched ? "bg-green-100 text-green-800 border-green-300" : ""}
                >
                  {keyword.text}
                  {keyword.matched && <CheckCircle className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Badge variant="default" className="h-4 px-1 bg-green-100 text-green-800 border-green-300">
                  <CheckCircle className="h-2 w-2" />
                </Badge>
                = Already in your resume
              </span>
              <span className="ml-4 inline-flex items-center gap-1">
                <Badge variant="outline" className="h-4 px-1">
                  
                </Badge>
                = Consider adding
              </span>
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

export default KeywordMatcher;
