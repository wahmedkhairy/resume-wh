
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

    const requestData = await req.json();
    const { content, sectionType, action } = requestData;

    if (action === "generate-summary") {
      return await generateSummary(content, openAIApiKey, corsHeaders);
    } else if (action === "recommend-skills") {
      return await recommendSkills(content, openAIApiKey, corsHeaders);
    } else if (sectionType === "courses-certifications") {
      return await polishCoursesAndCertifications(content, openAIApiKey, corsHeaders);
    } else if (!content || !sectionType) {
      throw new Error('Content and section type are required');
    } else {
      return await polishContent(content, sectionType, openAIApiKey, corsHeaders);
    }
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function polishContent(content: string, sectionType: string, apiKey: string, headers: Record<string, string>) {
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
      'Authorization': `Bearer ${apiKey}`,
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
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

async function generateSummary(experienceContent: string, apiKey: string, headers: Record<string, string>) {
  const systemPrompt = "You are a professional resume writer specializing in creating impactful professional summaries. " +
    "Based on the work experience provided, create a compelling professional summary that " +
    "highlights key skills, achievements, and professional identity. The summary should be 3-4 sentences, " +
    "use active voice, and be tailored to make the candidate stand out in their field. " +
    "Include years of experience, key technical skills, and notable achievements when applicable.";
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: experienceContent }
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`OpenAI API error: ${data.error.message}`);
  }

  const summary = data.choices[0].message.content;

  return new Response(JSON.stringify({ summary }), {
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

async function recommendSkills(experienceContent: string, apiKey: string, headers: Record<string, string>) {
  const systemPrompt = "You are a skills assessment expert for resumes. " +
    "Based on the provided work experience information, extract and recommend relevant technical and professional skills " +
    "that should be included in a resume. For each skill, assign a proficiency level between 1-100. " +
    "Return ONLY a JSON array with objects containing 'name' and 'level' properties. " +
    "Example: [{\"name\": \"JavaScript\", \"level\": 85}, {\"name\": \"Project Management\", \"level\": 75}]";
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: experienceContent }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`OpenAI API error: ${data.error.message}`);
  }

  try {
    // Extract the JSON array from the response
    const content = data.choices[0].message.content;
    const parsedContent = JSON.parse(content);
    const recommendations = parsedContent.skills || [];

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    throw new Error(`Failed to parse skills recommendations: ${error.message}`);
  }
}

async function polishCoursesAndCertifications(content: string, apiKey: string, headers: Record<string, string>) {
  try {
    const items = JSON.parse(content);
    
    const systemPrompt = "You are a professional resume writer specializing in courses and certifications sections. " +
      "Enhance the descriptions of the provided courses and certifications to make them more impactful and relevant. " +
      "Focus on the skills gained and the value of each credential. Keep descriptions concise (1-2 sentences). " +
      "Do not modify the titles, providers, dates, or types - only enhance the descriptions.";
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(items) }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }

    try {
      // Extract the enhanced items from the response
      const content = data.choices[0].message.content;
      const parsedContent = JSON.parse(content);
      const polishedItems = parsedContent.items || items;

      return new Response(JSON.stringify({ polishedItems }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      throw new Error(`Failed to parse enhanced items: ${error.message}`);
    }
  } catch (error) {
    throw new Error(`Invalid courses and certifications data: ${error.message}`);
  }
}
