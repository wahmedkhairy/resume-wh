import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ATSAnalysisRequest {
  resumeData: any;
  jobDescription?: string;
  analysisType: 'resume-only' | 'job-match';
}

interface ATSAnalysisResult {
  overallScore: number;
  formatScore: number;
  keywordScore: number;
  structureScore: number;
  contentScore: number;
  suggestions: string[];
  strengths: string[];
  warnings: string[];
  matchedKeywords?: string[];
  missingKeywords?: string[];
  detailedAnalysis: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { resumeData, jobDescription, analysisType }: ATSAnalysisRequest = await req.json();

    if (!resumeData) {
      throw new Error('Resume data is required');
    }

    // Build resume text for analysis
    const resumeText = buildResumeText(resumeData);
    
    let prompt = '';
    if (analysisType === 'job-match' && jobDescription) {
      prompt = createJobMatchPrompt(resumeText, jobDescription);
    } else {
      prompt = createResumeAnalysisPrompt(resumeText);
    }

    console.log('Analyzing resume with AI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert ATS (Applicant Tracking System) analyzer and career counselor with deep knowledge of modern recruitment practices. Provide detailed, actionable feedback to help candidates optimize their resumes for ATS systems and recruiters.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0].message.content;

    // Parse AI response and combine with rule-based analysis
    const combinedAnalysis = await combineAnalysis(resumeData, aiAnalysis, jobDescription, analysisType);

    return new Response(JSON.stringify(combinedAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in advanced-ats-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      overallScore: 0,
      formatScore: 0,
      keywordScore: 0,
      structureScore: 0,
      contentScore: 0,
      suggestions: ['Analysis failed. Please try again.'],
      strengths: [],
      warnings: ['There was an error analyzing your resume.'],
      detailedAnalysis: 'Analysis could not be completed due to an error.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildResumeText(resumeData: any): string {
  let text = '';
  
  // Personal info
  if (resumeData.personalInfo) {
    text += `Name: ${resumeData.personalInfo.name || ''}\n`;
    text += `Email: ${resumeData.personalInfo.email || ''}\n`;
    text += `Phone: ${resumeData.personalInfo.phone || ''}\n`;
    text += `Location: ${resumeData.personalInfo.location || ''}\n`;
    text += `Title: ${resumeData.personalInfo.jobTitle || ''}\n\n`;
  }
  
  // Summary
  if (resumeData.summary) {
    text += `Professional Summary:\n${resumeData.summary}\n\n`;
  }
  
  // Work Experience
  if (resumeData.workExperience?.length > 0) {
    text += 'Work Experience:\n';
    resumeData.workExperience.forEach((job: any) => {
      text += `${job.jobTitle} at ${job.company} (${job.startDate} - ${job.endDate})\n`;
      text += `Location: ${job.location || ''}\n`;
      if (job.responsibilities?.length > 0) {
        job.responsibilities.forEach((resp: string) => {
          text += `• ${resp}\n`;
        });
      }
      text += '\n';
    });
  }
  
  // Education
  if (resumeData.education?.length > 0) {
    text += 'Education:\n';
    resumeData.education.forEach((edu: any) => {
      text += `${edu.degree} from ${edu.institution} (${edu.graduationYear})\n`;
      if (edu.location) text += `Location: ${edu.location}\n`;
      text += '\n';
    });
  }
  
  // Skills
  if (resumeData.skills?.length > 0) {
    text += 'Skills:\n';
    resumeData.skills.forEach((skill: any) => {
      text += `• ${skill.name} (Level: ${skill.level || 'Not specified'})\n`;
    });
    text += '\n';
  }
  
  // Courses and Certifications
  if (resumeData.coursesAndCertifications?.length > 0) {
    text += 'Courses and Certifications:\n';
    resumeData.coursesAndCertifications.forEach((cert: any) => {
      text += `• ${cert.name}\n`;
      if (cert.description) text += `  ${cert.description}\n`;
    });
  }
  
  return text;
}

function createResumeAnalysisPrompt(resumeText: string): string {
  return `Please analyze this resume for ATS (Applicant Tracking System) compatibility and provide a detailed assessment. Return your analysis in the following JSON format:

{
  "overallScore": number (0-100),
  "formatScore": number (0-100),
  "keywordScore": number (0-100),
  "structureScore": number (0-100),
  "contentScore": number (0-100),
  "strengths": ["strength1", "strength2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "warnings": ["warning1", "warning2", ...],
  "detailedAnalysis": "comprehensive analysis explanation"
}

Consider these ATS factors:
1. Format compatibility (clean structure, standard sections)
2. Keyword optimization (industry-relevant terms, action verbs)
3. Content structure (clear headings, bullet points, proper formatting)
4. Content quality (quantifiable achievements, specific details)
5. Common ATS pitfalls (special characters, graphics, complex formatting)

Resume to analyze:
${resumeText}

Provide specific, actionable feedback to improve ATS compatibility.`;
}

function createJobMatchPrompt(resumeText: string, jobDescription: string): string {
  return `Analyze this resume against the provided job description for ATS compatibility and job match. Return your analysis in the following JSON format:

{
  "overallScore": number (0-100),
  "formatScore": number (0-100),
  "keywordScore": number (0-100),
  "structureScore": number (0-100),
  "contentScore": number (0-100),
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["missing1", "missing2", ...],
  "strengths": ["strength1", "strength2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "warnings": ["warning1", "warning2", ...],
  "detailedAnalysis": "comprehensive analysis explanation"
}

Focus on:
1. Keyword alignment with job requirements
2. Skills match with job description
3. Experience relevance to the position
4. ATS optimization for this specific role
5. Missing elements that would improve candidacy

Job Description:
${jobDescription}

Resume:
${resumeText}

Provide tailored recommendations for this specific job application.`;
}

async function combineAnalysis(
  resumeData: any, 
  aiAnalysis: string, 
  jobDescription?: string, 
  analysisType?: string
): Promise<ATSAnalysisResult> {
  try {
    // Try to parse AI response as JSON
    const parsed = JSON.parse(aiAnalysis);
    
    // Apply rule-based validation and adjustments
    const adjustedAnalysis = {
      overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
      formatScore: Math.min(100, Math.max(0, parsed.formatScore || 0)),
      keywordScore: Math.min(100, Math.max(0, parsed.keywordScore || 0)),
      structureScore: Math.min(100, Math.max(0, parsed.structureScore || 0)),
      contentScore: Math.min(100, Math.max(0, parsed.contentScore || 0)),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : undefined,
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : undefined,
      detailedAnalysis: parsed.detailedAnalysis || 'Analysis completed successfully.'
    };

    // Add rule-based validation
    addRuleBasedChecks(adjustedAnalysis, resumeData);
    
    return adjustedAnalysis;
    
  } catch (error) {
    console.error('Error parsing AI analysis:', error);
    
    // Fallback to rule-based analysis if AI parsing fails
    return createFallbackAnalysis(resumeData, aiAnalysis);
  }
}

function addRuleBasedChecks(analysis: ATSAnalysisResult, resumeData: any): void {
  // Ensure minimum checks are performed
  if (!resumeData.personalInfo?.email) {
    analysis.warnings.push('Missing email address - critical for ATS systems');
    analysis.structureScore = Math.max(0, analysis.structureScore - 10);
  }
  
  if (!resumeData.summary || resumeData.summary.length < 50) {
    analysis.suggestions.push('Add a professional summary (150-300 words recommended)');
  }
  
  if (!resumeData.workExperience?.length) {
    analysis.warnings.push('No work experience found - this may significantly impact ATS scoring');
    analysis.contentScore = Math.max(0, analysis.contentScore - 20);
  }
  
  // Recalculate overall score based on adjusted component scores
  analysis.overallScore = Math.round(
    (analysis.formatScore + analysis.keywordScore + analysis.structureScore + analysis.contentScore) / 4
  );
}

function createFallbackAnalysis(resumeData: any, aiAnalysis: string): ATSAnalysisResult {
  // Basic rule-based analysis as fallback
  let formatScore = 70;
  let keywordScore = 50;
  let structureScore = 50;
  let contentScore = 50;
  
  const suggestions: string[] = [];
  const strengths: string[] = [];
  const warnings: string[] = [];
  
  // Basic scoring logic
  if (resumeData.personalInfo?.email && resumeData.personalInfo?.phone) {
    formatScore += 10;
    strengths.push('Complete contact information');
  }
  
  if (resumeData.summary && resumeData.summary.length > 100) {
    contentScore += 15;
    strengths.push('Professional summary included');
  }
  
  if (resumeData.workExperience?.length > 0) {
    structureScore += 20;
    contentScore += 20;
  }
  
  const overallScore = Math.round((formatScore + keywordScore + structureScore + contentScore) / 4);
  
  return {
    overallScore,
    formatScore,
    keywordScore,
    structureScore,
    contentScore,
    suggestions,
    strengths,
    warnings,
    detailedAnalysis: `AI analysis: ${aiAnalysis.substring(0, 500)}...`
  };
}