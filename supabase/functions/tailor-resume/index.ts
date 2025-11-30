
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let userId: string | null = null;
    try {
      const token = authHeader.replace('Bearer', '').trim();
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      userId = payload.sub || payload.user_id || payload.id || null;
      console.log('Decoded user from JWT in tailor-resume:', userId);
    } catch (e) {
      console.error('Failed to decode JWT in tailor-resume:', e);
    }

    if (!userId) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate input
    const requestData = await req.json();
    const validated = TailorResumeSchema.parse(requestData);
    const { resumeData, jobDescription } = validated;
    
    // userId is derived from the authenticated JWT above
    const userIdFromToken = userId as string;
    
    console.log('Starting resume tailoring for user:', userIdFromToken);
    
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

Job Description:
${jobDescription}

Original Resume Data:
${JSON.stringify(resumeData, null, 2)}

Please return a JSON object with the same structure as the original resume data, but with tailored content. Only modify the text content - do not change the structure, IDs, or add/remove sections.`;

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
            content: 'You are an expert resume writer who specializes in tailoring resumes to specific job descriptions. Always return valid JSON that matches the input structure.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
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
      
      throw new Error(`AI API error: ${response.status} ${error}`);
    }

    const aiResponse = await response.json();
    console.log('Received response from Lovable AI');

    let tailoredContent;
    try {
      tailoredContent = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
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
