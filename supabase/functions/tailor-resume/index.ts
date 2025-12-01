
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const TailorResumeSchema = z.object({
  resumeData: z.object({}).passthrough(),
  jobDescription: z.string().min(10).max(5000),
  userId: z.string().uuid().optional() // Not used - we get from auth
});

function normalizeTailoredResume(tailored: any, original: any) {
  const normalized: any = {
    ...original,
    ...tailored,
  };

  normalized.personalInfo = {
    ...(original?.personalInfo || {}),
    ...(tailored?.personalInfo || {}),
  };

  normalized.summary =
    typeof tailored?.summary === "string"
      ? tailored.summary
      : original?.summary || "";

  const ensureArray = (key: string) => {
    const originalArr = Array.isArray(original?.[key]) ? original[key] : [];
    const tailoredArr = Array.isArray(tailored?.[key]) ? tailored[key] : undefined;
    normalized[key] = tailoredArr ?? originalArr;
  };

  ensureArray("workExperience");
  ensureArray("education");
  ensureArray("skills");
  ensureArray("coursesAndCertifications");
  ensureArray("projects");

  if (Array.isArray(normalized.workExperience)) {
    normalized.workExperience = normalized.workExperience.map(
      (job: any, index: number) => {
        const originalJob = Array.isArray(original?.workExperience)
          ? original.workExperience[index]
          : undefined;

        const mergedJob = {
          ...(originalJob || {}),
          ...(job || {}),
        };

        if (!Array.isArray(mergedJob.responsibilities)) {
          if (Array.isArray(originalJob?.responsibilities)) {
            mergedJob.responsibilities = originalJob.responsibilities;
          } else {
            mergedJob.responsibilities = [];
          }
        }

        return mergedJob;
      },
    );
  } else {
    normalized.workExperience = [];
  }

  return normalized;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // NOTE: This function is intentionally public and does not perform
    // its own authentication checks. Access control and any rate limiting
    // are handled at the platform/workspace level.


    // Validate input
    const requestData = await req.json();
    const validated = TailorResumeSchema.parse(requestData);
    const { resumeData, jobDescription } = validated;
    
    console.log('Starting resume tailoring request');
    
    // Get Lovable AI API key from secrets
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable AI API key not configured');
    }

    // Create the prompt for tailoring
    const prompt = `You are an expert resume writer. Please tailor the following resume to match the job description provided. Focus on:

1. Emphasizing relevant skills and experiences
2. Using keywords from the job description
3. Rewriting bullet points to highlight alignment with the role
4. Maintaining the overall structure and truthfulness of the original content

CRITICAL: You MUST return a JSON object with the EXACT same structure as the input resume data. Every field that exists in the input must exist in the output, including:
- All arrays (experience, education, skills, courses, projects) must remain as arrays
- Each experience item MUST include the "responsibilities" array field
- All nested objects and their properties must be preserved
- Do not add new fields or remove existing fields
- Only modify the text content to better match the job description

Job Description:
${jobDescription}

Original Resume Data:
${JSON.stringify(resumeData, null, 2)}

Return ONLY a valid JSON object with the tailored resume data, maintaining the exact same structure as the input.`;

    console.log('Calling Lovable AI for resume tailoring');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer who specializes in tailoring resumes to specific job descriptions. Return ONLY valid JSON that matches the input structure, without any markdown formatting or code blocks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lovable AI API error:', error);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI credits depleted. Please add credits to your workspace.');
      }
      if (response.status === 503) {
        throw new Error('AI service is temporarily unavailable. Please try again.');
      }
      
      throw new Error(`AI API error: ${response.status} ${error}`);
    }

    const aiResponse = await response.json();
    console.log('Received response from Lovable AI');

    let tailoredContent;
    try {
      const message = aiResponse?.choices?.[0]?.message;
      let rawContent = message?.content;

      // If the model already returned structured JSON, use it directly
      if (typeof rawContent === "object" && rawContent !== null) {
        tailoredContent = normalizeTailoredResume(rawContent, resumeData);
      } else if (typeof rawContent === "string") {
        let content = rawContent;
        
        // Strip markdown code blocks if present
        if (content.startsWith('```json')) {
          content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (content.startsWith('```')) {
          content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsed = JSON.parse(content);
        tailoredContent = normalizeTailoredResume(parsed, resumeData);
      } else {
        console.error('Unexpected AI response format:', aiResponse);
        throw new Error('Unexpected AI response format from AI service.');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tailoredContent,
        originalContent: resumeData 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in tailor-resume function:', error);
    
    // Handle validation errors specifically
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input data',
          details: error.errors
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
