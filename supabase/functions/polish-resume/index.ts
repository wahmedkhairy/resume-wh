
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const { content, sectionType } = await req.json();

    if (!content || !sectionType) {
      throw new Error('Content and section type are required');
    }

    let systemPrompt = "You are a professional resume editor. ";
    
    // Customize the system prompt based on section type
    switch(sectionType) {
      case "summary":
        systemPrompt += "Polish this professional summary to be concise, impactful, and highlight key strengths. Use active voice and professional language. Keep it under 4 sentences.";
        break;
      case "experience":
        systemPrompt += "Format and enhance these work experience bullet points. Use action verbs, quantify achievements where possible, and focus on results. Keep each bullet point concise.";
        break;
      case "education":
        systemPrompt += "Format this education information clearly and professionally. Include degree, institution, location, and graduation year if available. Highlight relevant coursework or achievements if mentioned.";
        break;
      case "skills":
        systemPrompt += "Organize these skills clearly and professionally. Group similar skills together if appropriate. Remove any irrelevant or overly general skills.";
        break;
      default:
        systemPrompt += "Polish this content to be clear, professional, and concise. Use active voice and professional language.";
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    const polishedContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ polishedContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
