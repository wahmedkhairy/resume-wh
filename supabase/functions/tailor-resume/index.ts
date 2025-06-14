
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, jobDescription, userId } = await req.json();
    
    console.log('Starting resume tailoring for user:', userId);
    
    // Get OpenAI API key from secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
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

    console.log('Calling OpenAI API for resume tailoring');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const openaiResponse = await response.json();
    console.log('Received response from OpenAI');

    let tailoredContent;
    try {
      tailoredContent = JSON.parse(openaiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
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
