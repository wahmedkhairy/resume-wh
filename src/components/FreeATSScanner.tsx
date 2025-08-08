
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, Zap, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
interface ATSAnalysisResult {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  contentScore: number;
  suggestions: string[];
  strengths: string[];
  isWeak: boolean;
  extractedData?: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      jobTitle: string;
    };
    summary: string;
    workExperience: Array<{
      id: string;
      jobTitle: string;
      company: string;
      startDate: string;
      endDate: string;
      location: string;
      responsibilities: string[];
    }>;
    education: Array<{
      id: string;
      degree: string;
      institution: string;
      graduationYear: string;
      location: string;
    }>;
    skills: Array<{
      id: string;
      name: string;
      level: number;
    }>;
    rawText?: string; // original extracted text for higher-accuracy AI analysis
  };
}

const FreeATSScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a PDF or Word document.");
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File too large. Please upload a file smaller than 5MB.");
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      if (file.type === 'application/msword') {
        toast({
          title: "Limited support for .doc",
          description: "Legacy .doc parsing is limited. For best accuracy, upload PDF or DOCX.",
        });
      }

      setSelectedFile(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const extractResumeData = async (file: File): Promise<ATSAnalysisResult['extractedData']> => {
    try {
      let extractedText = "";
      
      if (file.type === 'application/pdf') {
        extractedText = await simulateAdvancedPDFExtraction(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOCX: use Mammoth for reliable text extraction
        extractedText = await simulateAdvancedWordExtraction(file);
      } else if (file.type === 'application/msword') {
        // Legacy .doc is not reliably parseable in-browser
        console.warn('Legacy .doc detected: limited parsing support');
        extractedText = file.name.replace(/[_\-\.]/g, ' ');
      } else {
        // Other: basic text extraction
        extractedText = await file.text();
      }

      const structured = parseExtractedText(extractedText, file.name);
      return { ...structured, rawText: extractedText };
    } catch (error) {
      const structured = parseExtractedText("", file.name);
      return { ...structured, rawText: "" };
    }
  };

  const simulateAdvancedPDFExtraction = async (file: File): Promise<string> => {
    try {
      const buf = await file.arrayBuffer();
      const raw = new TextDecoder('latin1').decode(new Uint8Array(buf));
      // Naive PDF text extraction: collect text between parentheses
      const matches = Array.from(raw.matchAll(/\(([^)]+)\)/g)).map(m => m[1]);
      const extracted = matches.join('\n');
      return (extracted && extracted.trim().length > 0) ? extracted : raw.slice(0, 5000);
    } catch (e) {
      console.error('PDF extraction failed, using filename hints:', e);
      return file.name.replace(/[_\-\.]/g, ' ');
    }
  };

  const simulateAdvancedWordExtraction = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Dynamically import browser build of mammoth to keep bundle lean
      // @ts-ignore - mammoth browser build has no types
      const mammoth = await import('mammoth/mammoth.browser');
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html: string = result.value || '';
      const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      return text;
    } catch (e) {
      console.error('DOCX extraction failed, falling back to filename:', e);
      return file.name.replace(/[_\-\.]/g, ' ');
    }
  };

  const parseExtractedText = (text: string, fileName: string): ATSAnalysisResult['extractedData'] => {
    // Parse the extracted text to build structured data
    const lines = text.split('\n').filter(line => line.trim());
    
    const name = extractName(lines, fileName);
    const email = extractEmail(lines, fileName);
    const phone = extractPhone(lines);
    const location = extractLocation(lines);
    
    return {
      personalInfo: {
        name,
        email,
        phone,
        location,
        jobTitle: getJobTitleFromFileName(fileName)
      },
      summary: extractSummary(lines),
      workExperience: extractWorkExperience(lines, fileName),
      education: extractEducation(lines, fileName),
      skills: extractSkills(lines, fileName)
    };
  };

  // Helper functions for more realistic data extraction
  const getNameFromFileName = (fileName: string): string => {
    const cleanName = fileName.replace(/[_\-\.]/g, ' ').replace(/\.(pdf|doc|docx)$/i, '');
    const words = cleanName.split(' ').filter(word => word.length > 1);
    
    if (words.length >= 2) {
      return words.slice(0, 2).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return "Professional Candidate";
  };

  const generateEmail = (fileName: string): string => {
    const name = getNameFromFileName(fileName).toLowerCase().replace(' ', '.');
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com'];
    return `${name}@${domains[Math.floor(Math.random() * domains.length)]}`;
  };

  const getJobTitleFromFileName = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('marketing')) return "Marketing Manager";
    if (lowerName.includes('engineer') || lowerName.includes('dev')) return "Software Engineer";
    if (lowerName.includes('manager')) return "Project Manager";
    if (lowerName.includes('analyst')) return "Business Analyst";
    if (lowerName.includes('designer')) return "UX Designer";
    if (lowerName.includes('sales')) return "Sales Representative";
    if (lowerName.includes('hr') || lowerName.includes('human')) return "HR Specialist";
    
    return "Professional";
  };

  const getDegreeFromFileName = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('engineering') || lowerName.includes('tech')) return "Computer Science";
    if (lowerName.includes('business') || lowerName.includes('mba')) return "Business Administration";
    if (lowerName.includes('marketing')) return "Marketing";
    if (lowerName.includes('finance')) return "Finance";
    
    return "Business";
  };

  const getIndustrySpecificContent = (fileName: string): string => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('marketing')) {
      return `
ADDITIONAL SKILLS
• Digital Marketing Strategy
• SEO/SEM Optimization
• Social Media Management
• Content Marketing
• Analytics & Reporting
• Campaign Management
`;
    }
    
    if (lowerName.includes('engineer') || lowerName.includes('dev')) {
      return `
TECHNICAL SKILLS
• JavaScript, Python, Java
• React, Node.js, Angular
• AWS, Docker, Kubernetes
• Git, CI/CD, Agile
• Database Management
• API Development
`;
    }
    
    return "";
  };

  const extractName = (lines: string[], fileName: string): string => {
    // Look for name patterns in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line && !line.includes('@') && !line.includes('(') && line.length < 50) {
        // Likely a name if it's short and doesn't contain email/phone patterns
        const words = line.split(' ').filter(w => w.length > 1);
        if (words.length >= 2 && words.length <= 4) {
          return line;
        }
      }
    }
    return getNameFromFileName(fileName);
  };

  const extractEmail = (lines: string[], fileName: string): string => {
    for (const line of lines) {
      const emailMatch = line.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
      if (emailMatch) return emailMatch[0];
    }
    return generateEmail(fileName);
  };

  const extractPhone = (lines: string[]): string => {
    for (const line of lines) {
      const phoneMatch = line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch) return phoneMatch[0];
    }
    return "(555) 123-4567";
  };

  const extractLocation = (lines: string[]): string => {
    for (const line of lines) {
      if (line.match(/\b\w+,\s*[A-Z]{2}\b/)) {
        return line.trim();
      }
    }
    return "New York, NY";
  };

  const extractSummary = (lines: string[]): string => {
    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    let summaryStartIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        summaryStartIndex = i + 1;
        break;
      }
    }
    
    if (summaryStartIndex !== -1) {
      const summaryLines = [];
      for (let i = summaryStartIndex; i < Math.min(summaryStartIndex + 5, lines.length); i++) {
        if (lines[i] && !lines[i].toLowerCase().includes('experience') && 
            !lines[i].toLowerCase().includes('education')) {
          summaryLines.push(lines[i]);
        } else {
          break;
        }
      }
      if (summaryLines.length > 0) {
        return summaryLines.join(' ').substring(0, 300);
      }
    }
    
    return "Experienced professional with strong background in industry best practices and team collaboration.";
  };

  const extractWorkExperience = (lines: string[], fileName: string): any[] => {
    const bullets = lines.filter(l => /^[\u2022•\-–\*]\s+/.test(l.trim())).map(l => l.replace(/^[\u2022•\-–\*]\s+/, '').trim());
    const roles: any[] = [];

    // Try to find likely role lines near 'experience' section
    const expIndex = lines.findIndex(l => /experience|work history/i.test(l));
    const windowStart = Math.max(0, expIndex === -1 ? 0 : expIndex);
    const windowLines = lines.slice(windowStart, windowStart + 80);

    const titleRegex = /(engineer|developer|designer|manager|analyst|consultant|specialist|director|lead)/i;
    const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s+\d{4}|\b\d{4}\b/g;

    for (let i = 0; i < windowLines.length; i++) {
      const line = windowLines[i].trim();
      if (titleRegex.test(line) && !line.includes('@')) {
        const jobTitle = line;
        // Look ahead for company line and dates
        let company = '';
        let dates = '';
        for (let j = i + 1; j < Math.min(i + 4, windowLines.length); j++) {
          const l2 = windowLines[j];
          if (!company && /(inc\.|llc|ltd|company|corp|technologies|studios|solutions|systems|labs)/i.test(l2)) {
            company = l2.trim();
          }
          const dd = (l2.match(dateRegex) || []).join(' - ');
          if (!dates && dd) dates = dd;
        }
        roles.push({ id: `exp${roles.length+1}`, jobTitle, company: company || 'Company', startDate: dates || '', endDate: '', location: '', responsibilities: [] });
        if (roles.length >= 3) break;
      }
    }

    // Distribute bullets to roles
    if (roles.length === 0 && bullets.length > 0) {
      roles.push({ id: 'exp1', jobTitle: 'Experience', company: 'Company', startDate: '', endDate: '', location: '', responsibilities: bullets.slice(0, 5) });
    } else if (roles.length > 0) {
      const per = Math.max(2, Math.floor(bullets.length / roles.length));
      roles.forEach((r, idx) => { r.responsibilities = bullets.slice(idx*per, idx*per + per); });
    }

    return roles.slice(0, 3);
  };

  const extractEducation = (lines: string[], fileName: string): any[] => {
    const edu: any[] = [];
    const degreeRegex = /(bachelor|master|mba|phd|b\.?sc|m\.?sc|b\.?a|b\.tech|m\.tech)/i;
    const instRegex = /(university|college|institute|school)/i;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (degreeRegex.test(line) || instRegex.test(line)) {
        const degree = (line.match(degreeRegex)?.[0] || '').replace(/\./g, '').toUpperCase();
        const institution = instRegex.test(line) ? line.trim() : (lines[i+1] || '').trim();
        edu.push({ id: `edu${edu.length+1}`, degree: degree || 'Degree', institution: institution || 'Institution', graduationYear: (line.match(/\b\d{4}\b/) || [])[0] || '', location: '' });
        if (edu.length >= 2) break;
      }
    }
    return edu;
  };

  const extractSkills = (lines: string[], fileName: string): any[] => {
    const text = lines.join(' ');
    // Try dedicated Skills section first
    const skillsStart = lines.findIndex(l => /\bskills?\b/i.test(l));
    let raw = '';
    if (skillsStart !== -1) {
      const block = lines.slice(skillsStart + 1, skillsStart + 8).join(' ');
      raw = block;
    } else {
      raw = text;
    }

    const candidates = Array.from(new Set(raw.split(/[\n,;•\u2022\|]/).map(s => s.trim()).filter(s => s.length >= 2 && s.length <= 40)));

    // Filter to likely skill tokens (letters, numbers, + some symbols)
    const likely = candidates.filter(s => /[a-z]/i.test(s) && !/@|http|www|\d{5,}/i.test(s));

    // If still empty, fallback lightly to industry hints
    const final = likely.slice(0, 12);
    const fill = final.length < 6 ? getIndustrySkills(fileName).slice(0, 12 - final.length) : [];
    const all = [...final, ...fill].slice(0, 12);

    return all.map((name, idx) => ({ id: `skill${idx+1}`, name, level: 60 + ((idx*7)%40) }));
  };

  const getIndustrySkills = (fileName: string): string[] => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('marketing')) {
      return ["Digital Marketing", "SEO/SEM", "Content Strategy", "Analytics", "Social Media"];
    }
    if (lowerName.includes('engineer') || lowerName.includes('dev')) {
      return ["JavaScript", "React", "Node.js", "Python", "AWS"];
    }
    if (lowerName.includes('design')) {
      return ["Adobe Creative Suite", "Figma", "UI/UX Design", "Prototyping", "User Research"];
    }
    
    return ["Data Analysis", "Strategic Planning", "Process Improvement"];
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a resume file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Simulate realistic ATS analysis with proper error handling
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Extract resume data
      const extractedData = await extractResumeData(selectedFile);

      // Use extracted raw text for highest fidelity
      const text = (extractedData as any)?.rawText || '';
      const analysis = await performATSAnalysis(text, selectedFile.name, extractedData);

      setAnalysisResult(analysis);

      if (analysis.isWeak) {
        toast({
          title: "Resume Needs Improvement",
          description: "Your resume scored below 80%. Consider using our resume builder to improve your ATS compatibility.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Your resume scored ${analysis.overallScore}% for ATS compatibility.`,
        });
      }

    } catch (error) {
      console.error('Free ATS Scanner error:', error);
      setError("There was an error analyzing your resume. Please try again.");
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // This will now be handled by the enhanced extractResumeData function
    // Return simplified text for backward compatibility
    return `Resume content for ${file.name} - processed for ATS analysis`;
  };

  const performATSAnalysis = async (text: string, fileName: string, extractedData: any): Promise<ATSAnalysisResult> => {
    try {
      console.log('Starting AI-powered free ATS analysis...');

      // Call the new AI-powered ATS analysis
      const { data: aiAnalysis, error } = await supabase.functions.invoke('advanced-ats-analysis', {
        body: {
          resumeData: extractedData,
          resumeText: text,
          analysisType: 'resume-only'
        },
      });

      if (error) {
        throw new Error(error.message || 'Edge function error');
      }
      
      console.log('AI free ATS analysis complete:', aiAnalysis);

      const isWeak = aiAnalysis.overallScore < 80;

      return {
        overallScore: aiAnalysis.overallScore,
        formatScore: aiAnalysis.formatScore,
        keywordScore: aiAnalysis.keywordScore,
        contentScore: aiAnalysis.contentScore,
        suggestions: aiAnalysis.suggestions || [],
        strengths: aiAnalysis.strengths || [],
        isWeak,
        extractedData
      };

    } catch (error) {
      console.error('AI analysis failed, using fallback analysis:', error);
      
      // Fallback to basic analysis
      return performBasicATSAnalysis(text, fileName, extractedData);
    }
  };

  const performBasicATSAnalysis = (text: string, fileName: string, extractedData: any): ATSAnalysisResult => {
    // Stronger rule-based analysis to avoid false positives on gibberish
    let formatScore = 40;
    let keywordScore = 30;
    let contentScore = 25;

    const suggestions: string[] = [];
    const strengths: string[] = [];

    const safeStr = (s?: string) => (s || '').toString();

    // Build full text from extracted data
    const fullText = [
      safeStr(extractedData?.rawText),
      safeStr(extractedData?.summary),
      ...(extractedData?.workExperience || []).flatMap((j: any) => [safeStr(j.jobTitle), safeStr(j.company), ...(j.responsibilities || [])]),
      ...(extractedData?.skills || []).map((s: any) => safeStr(s.name))
    ].join(' ').trim();

    const cleaned = fullText.toLowerCase().replace(/[^a-z0-9%\s.\-]/g, ' ');
    const words = cleaned.split(/\s+/).filter(Boolean);
    const longNoVowel = words.filter(w => w.length >= 5 && !/[aeiou]/.test(w));
    const repeatedSeq = /(.)\1{3,}/i.test(cleaned);
    const nonsenseRate = words.length ? (longNoVowel.length / words.length) : 1;
    const tooShort = words.length < 80;

    if (repeatedSeq || nonsenseRate > 0.3 || tooShort) {
      contentScore = Math.max(0, contentScore - 25);
      keywordScore = Math.max(0, keywordScore - 20);
      suggestions.push("Replace random letters/placeholder text with meaningful sentences.");
    }

    // Personal Info
    if (extractedData?.personalInfo?.email && extractedData?.personalInfo?.phone) {
      formatScore += 15;
      strengths.push("Contact details included");
    } else {
      suggestions.push("Add email and phone in the header");
    }
    if (extractedData?.personalInfo?.name && extractedData?.personalInfo?.location) {
      formatScore += 10;
    }

    // Summary
    if (safeStr(extractedData?.summary).length >= 120) {
      contentScore += 20;
      strengths.push("Clear professional summary");
    } else {
      suggestions.push("Add a 150–300 word professional summary");
    }

    // Experience
    if ((extractedData?.workExperience || []).length > 0) {
      contentScore += 25;
      formatScore += 10;

      const hasDetailedResponsibilities = (extractedData.workExperience || []).some((job: any) => job.responsibilities && job.responsibilities.length >= 2);
      if (hasDetailedResponsibilities) {
        contentScore += 15;
        keywordScore += 15;
      } else {
        suggestions.push("Add 3–6 impact-focused bullets per role");
      }
    } else {
      suggestions.push("Add work experience with responsibilities");
    }

    // Education
    if ((extractedData?.education || []).length > 0) {
      contentScore += 15;
    } else {
      suggestions.push("Include your education details");
    }

    // Skills depth
    if ((extractedData?.skills || []).length >= 6) {
      keywordScore += 25;
      strengths.push("Good skills coverage");
    } else if ((extractedData?.skills || []).length > 0) {
      keywordScore += 10;
      suggestions.push("Add more role-relevant skills");
    } else {
      suggestions.push("Add a skills section (tools, methods, technologies)");
    }

    // Action verbs and metrics
    const actionVerbs = ['led','managed','built','created','implemented','designed','optimized','improved','launched','delivered','increased','reduced','developed','analyzed','collaborated','negotiated','trained','mentored','automated'];
    const hasActionVerb = actionVerbs.some(v => new RegExp(`\\b${v}\\b`, 'i').test(fullText));
    if (hasActionVerb) strengths.push("Uses strong action verbs"); else suggestions.push("Start bullets with action verbs (Led, Built, Implemented)");

    const hasMetrics = /(\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d+%\b)/.test(fullText);
    if (hasMetrics) { contentScore += 10; strengths.push("Quantified achievements present"); } else { suggestions.push("Quantify impact with numbers/percentages"); }

    // General ATS keywords (role-agnostic) + light industry hint from filename
    const generalKeywords = ['project management','stakeholder','kpi','metrics','analysis','strategy','communication','leadership','collaboration','budget','process improvement','crm','sql','excel','reporting','presentation','problem solving','agile','api','cloud','automation','compliance','risk','roadmap'];
    const industryKeywords = getIndustryKeywords(fileName);
    const allKeywords = Array.from(new Set([...generalKeywords, ...industryKeywords]));
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matched = allKeywords.filter(k => new RegExp(`\\b${escape(k)}\\b`, 'i').test(fullText));
    keywordScore += Math.min(30, matched.length * 3);

    const overuse = allKeywords.some(k => (fullText.match(new RegExp(`\\b${escape(k)}\\b`, 'gi')) || []).length > 10);
    if (overuse) {
      keywordScore = Math.max(0, keywordScore - 10);
    }

    // Clamp and compute overall
    formatScore = Math.min(100, Math.max(0, formatScore));
    keywordScore = Math.min(100, Math.max(0, keywordScore));
    contentScore = Math.min(100, Math.max(0, contentScore));

    const overallScore = Math.round((formatScore + keywordScore + contentScore) / 3);
    const isWeak = overallScore < 80;

    // Final suggestions/strengths summarization
    if (keywordScore < 60) {
      suggestions.push("Add industry keywords naturally (avoid stuffing)");
    }
    if (contentScore < 60) {
      suggestions.push("Expand bullets with concrete outcomes and scope");
    }

    return {
      overallScore,
      formatScore,
      keywordScore,
      contentScore,
      suggestions,
      strengths,
      isWeak,
      extractedData
    };
  };

  const getIndustryKeywords = (fileName: string): string[] => {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('marketing')) {
      return ['marketing', 'campaign', 'analytics', 'SEO', 'content', 'social media', 'ROI', 'brand'];
    }
    if (lowerName.includes('engineer') || lowerName.includes('dev')) {
      return ['development', 'programming', 'software', 'code', 'API', 'database', 'framework', 'agile'];
    }
    if (lowerName.includes('manager')) {
      return ['management', 'leadership', 'team', 'project', 'strategy', 'budget', 'process', 'stakeholder'];
    }
    if (lowerName.includes('analyst')) {
      return ['analysis', 'data', 'research', 'reporting', 'insights', 'metrics', 'optimization', 'dashboard'];
    }
    if (lowerName.includes('sales')) {
      return ['sales', 'revenue', 'client', 'negotiation', 'pipeline', 'CRM', 'quota', 'relationship'];
    }
    
    return ['achievement', 'results', 'improvement', 'collaboration', 'innovation', 'efficiency'];
  };

  const handleFixResume = () => {
    if (analysisResult?.extractedData) {
      // Store the extracted data in localStorage to transfer to resume builder
      localStorage.setItem('uploadedResumeData', JSON.stringify(analysisResult.extractedData));
      localStorage.setItem('resumeImprovementTips', JSON.stringify(analysisResult.suggestions));
      localStorage.setItem('atsAnalysisCompleted', 'true');
      
      toast({
        title: "Redirecting to Resume Builder",
        description: "Your resume data has been extracted and will be loaded in the builder.",
      });

      // Navigate to the resume builder
      navigate('/');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Free ATS Scanner
        </CardTitle>
        <CardDescription>
          Upload your resume for a free ATS compatibility analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <div className="space-y-2">
            <label htmlFor="resume-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-blue-600 hover:text-blue-700">
                Choose your resume file
              </span>
              <input
                id="resume-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isScanning}
              />
            </label>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, and DOCX files (max 5MB)
            </p>
          </div>
          {selectedFile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Selected: {selectedFile.name}
              </p>
              <p className="text-xs text-blue-600">
                Size: {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}
        </div>

        <Button 
          onClick={analyzeResume}
          disabled={!selectedFile || isScanning}
          className="w-full"
          size="lg"
        >
          <Zap className="mr-2 h-4 w-4" />
          {isScanning ? "Analyzing Resume..." : "Start ATS Scan"}
        </Button>

        {isScanning && (
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold">Scanning your resume...</div>
            <Progress value={66} className="w-full animate-pulse" />
            <p className="text-sm text-muted-foreground">
              Analyzing format, keywords, and content structure
            </p>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6 border-t pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getScoreIcon(analysisResult.overallScore)}
                <span className={`text-4xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore}%
                </span>
              </div>
              <p className="text-muted-foreground">Overall ATS Compatibility Score</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.formatScore)}`}>
                  {analysisResult.formatScore}%
                </div>
                <p className="text-xs text-muted-foreground">Format</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.keywordScore)}`}>
                  {analysisResult.keywordScore}%
                </div>
                <p className="text-xs text-muted-foreground">Keywords</p>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getScoreColor(analysisResult.contentScore)}`}>
                  {analysisResult.contentScore}%
                </div>
                <p className="text-xs text-muted-foreground">Content</p>
              </div>
            </div>

            {analysisResult.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths
                </h4>
                <div className="space-y-1">
                  {analysisResult.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 mr-2 mb-1">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Improvement Suggestions
                </h4>
                <ul className="space-y-2">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.overallScore < 80 && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 p-6 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  🚨 Resume Needs Optimization
                </h4>
                <p className="text-sm text-orange-700 mb-4">
                  Your resume scored {analysisResult.overallScore}% and needs improvement to pass ATS systems effectively. 
                  Let our AI-powered resume builder automatically fix these issues and optimize your resume for better results.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleFixResume}
                    className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                    size="sm"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Fix My Resume
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/subscription'}
                    variant="outline" 
                    size="sm"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Get Premium Features
                  </Button>
                </div>
              </div>
            )}

            {analysisResult.overallScore >= 80 && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">
                  ✅ Great Job!
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Your resume has good ATS compatibility! You can still use our resume builder to create an even more polished version.
                </p>
                <Button 
                  onClick={handleFixResume}
                  variant="outline" 
                  size="sm"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Enhance My Resume
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreeATSScanner;
