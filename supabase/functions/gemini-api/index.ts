
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const { action, data } = await req.json();

    let endpoint = '';
    let requestBody = {};

    switch (action) {
      case 'generate_course':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Create a complete course on ${data.topic} for ${data.purpose} at ${data.difficulty} level. 
                     Include a summary, list of chapters with detailed content, flashcards, multiple choice questions, and Q&A pairs.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        };
        break;

      case 'generate_interview_questions':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Generate ${data.questionCount || 5} interview questions for a ${data.experience} years experienced ${data.jobRole} 
                     with expertise in ${data.techStack}. The questions should be challenging and relevant to the role.
                     Format the response as a numbered list with just the questions.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        };
        break;

      case 'analyze_interview':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Analyze this interview response for a ${data.jobRole} position. 
                     Question: ${data.question}
                     Answer: ${data.answer}
                     
                     Provide detailed analysis in the following format:
                     
                     Technical Feedback: (Analyze understanding of technical concepts and accuracy)
                     Communication Feedback: (Analyze clarity, structure, and language used)
                     Strengths: (List 3 specific strengths in the response)
                     Areas to Improve: (List 3 specific areas that could be improved)
                     Overall Rating: (Give a rating between 0-100)`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        };
        break;

      case 'analyze_speech':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Analyze this speech transcript for a ${data.jobRole} interview:
                    
                     "${data.transcript}"
                     
                     Evaluate the speaking skills in terms of:
                     1. Clarity (how clear and understandable the speech is)
                     2. Confidence (how confident the speaker sounds)
                     3. Fluency (how smoothly the speech flows)
                     4. Grammar and vocabulary (correctness and richness of language)
                     5. Technical accuracy (correct use of technical terms)
                     
                     Provide a rating for each category (0-100) and specific feedback on how to improve.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        };
        break;

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from Gemini API:', errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-api function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
