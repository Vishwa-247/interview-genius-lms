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
    console.log("Edge function invoked");
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || "AIzaSyBgMvHfIYb06Bn3oBi8Y-ykFR7J_n5zx18";
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const { action, data } = await req.json();
    console.log(`Processing ${action} request with data:`, data);

    let endpoint = '';
    let requestBody = {};
    let responseHandler;

    switch (action) {
      case 'generate_course':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Create a complete course on ${data.topic} for ${data.purpose} at ${data.difficulty} level.
                     
                     Follow this exact structure:
                     
                     # SUMMARY
                     Provide a concise overview of what the course covers and its objectives.
                     
                     # CHAPTERS
                     Create 5-8 logically structured chapters. For each chapter:
                     - Title: Clear and descriptive chapter title
                     - Content: Detailed and comprehensive content with examples, explanations, and relevant concepts
                     
                     # FLASHCARDS
                     Create at least 15 flashcards in this format:
                     - Question: [question text]
                     - Answer: [answer text]
                     
                     # MCQs (Multiple Choice Questions)
                     Create at least 10 multiple choice questions in this format:
                     - Question: [question text]
                     - Options: 
                       a) [option text]
                       b) [option text]
                       c) [option text]
                       d) [option text]
                     - Correct Answer: [correct letter]
                     
                     # Q&A PAIRS
                     Create at least 10 question and answer pairs for deeper understanding:
                     - Question: [detailed question]
                     - Answer: [comprehensive answer]
                     
                     Make sure the entire course is educational, accurate, and provides comprehensive knowledge on ${data.topic}. Adapt the content to be appropriate for ${data.purpose} at ${data.difficulty} level.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        };
        
        // If courseId is provided, this is a background generation request
        if (data.courseId) {
          // Process in background and immediately return success
          EdgeRuntime.waitUntil(
            processBackgroundCourseGeneration(GEMINI_API_KEY, endpoint, requestBody, data.courseId, data.topic)
          );
          
          return new Response(JSON.stringify({
            success: true,
            message: "Course generation started in background",
            data: { status: 'generating' }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        break;

      case 'generate_interview_questions':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Generate ${data.questionCount || 5} interview questions for a ${data.experience} years experienced ${data.jobRole} 
                     with expertise in ${data.techStack}. The questions should be challenging and relevant to the role.
                     
                     For each question:
                     1. Focus on both technical knowledge and practical application
                     2. Include questions that test problem-solving abilities
                     3. Add questions about handling specific scenarios they might encounter
                     4. Include questions about their approach to teamwork and collaboration
                     
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

      case 'analyze_facial_expression':
        endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        requestBody = {
          contents: [{
            parts: [{
              text: `Analyze this description of facial expressions during an interview:
                     
                     ${data.facialData}
                     
                     Provide feedback on:
                     1. Overall impression (how the candidate appears to interviewers)
                     2. Confidence signals (what expressions indicate confidence or lack thereof)
                     3. Engagement level (how engaged the person appears to be)
                     4. Improvement suggestions (specific tips to improve facial expressions)
                     
                     Include specific techniques the candidate can practice to improve their non-verbal communication.`
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

    console.log(`Making request to Gemini API: ${endpoint} with action: ${action}`);
    
    // Set a timeout for the API call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    try {
      const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error from Gemini API:', errorData);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log(`Gemini API response received successfully for ${action}`);
      
      return new Response(JSON.stringify({
        success: true,
        data: responseData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        console.error('Gemini API request timed out');
        throw new Error('API request timed out. Please try again later.');
      }
      throw fetchError;
    }
    
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

// Background processing function
async function processBackgroundCourseGeneration(
  apiKey: string,
  endpoint: string,
  requestBody: any,
  courseId: string,
  topic: string
) {
  console.log(`Starting background course generation for course ${courseId}`);
  
  try {
    // Create Supabase admin client for updating the database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Update course status to generating
    await supabaseAdmin
      .from('courses')
      .update({ 
        content: { status: 'generating', lastUpdated: new Date().toISOString() } 
      })
      .eq('id', courseId);
      
    // Call Gemini API
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Background generation error from Gemini API:', errorData);
      
      await supabaseAdmin
        .from('courses')
        .update({ 
          content: { 
            status: 'error', 
            message: `API error: ${response.status} ${response.statusText}`,
            lastUpdated: new Date().toISOString()
          } 
        })
        .eq('id', courseId);
        
      return;
    }
    
    const responseData = await response.json();
    console.log(`Background generation completed successfully for course ${courseId}`);
    
    // Extract text content
    const text = responseData.candidates[0].content.parts[0].text;
    
    // Extract summary
    let summary = `An AI-generated course on ${topic}`;
    const summaryMatch = text.match(/SUMMARY[:\n]+([^#]+)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim().substring(0, 500);
    }
    
    // Update course with complete content
    await supabaseAdmin
      .from('courses')
      .update({ 
        summary,
        content: {
          status: 'complete',
          fullText: text,
          generatedAt: new Date().toISOString(),
          parsedContent: text
        } 
      })
      .eq('id', courseId);
      
    console.log(`Course ${courseId} updated with generated content`);
    
  } catch (error) {
    console.error(`Error in background processing for course ${courseId}:`, error);
    
    // Try to update the course with error status
    try {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      );
      
      await supabaseAdmin
        .from('courses')
        .update({ 
          content: { 
            status: 'error', 
            message: error.message || 'Unknown error during background processing',
            lastUpdated: new Date().toISOString()
          } 
        })
        .eq('id', courseId);
    } catch (updateError) {
      console.error(`Failed to update error status for course ${courseId}:`, updateError);
    }
  }
}

// Import createClient for Supabase admin operations in background processing
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
