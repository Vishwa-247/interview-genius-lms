
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const { action, data } = await req.json();
    console.log(`Processing ${action} request with data:`, data);

    let endpoint = '';
    let requestBody = {};

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
          console.log(`Starting background course generation for course ${data.courseId}`);
          
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

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    console.log(`Making request to Gemini API: ${endpoint} with action: ${action}`);
    
    // Set a timeout for the API call
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
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
      
    console.log(`Updated course ${courseId} status to generating`);
      
    // Call Gemini API
    console.log(`Calling Gemini API for course ${courseId}`);
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
        
      console.log(`Updated course ${courseId} status to error due to API response error`);
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
    
    // Parse the content into structured format
    const parsedContent = parseGeneratedContent(text);
    
    // Update course with complete content
    await supabaseAdmin
      .from('courses')
      .update({ 
        summary,
        content: {
          status: 'complete',
          fullText: text,
          generatedAt: new Date().toISOString(),
          parsedContent
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
        
      console.log(`Updated course ${courseId} status to error due to background processing error`);
    } catch (updateError) {
      console.error(`Failed to update error status for course ${courseId}:`, updateError);
    }
  }
}

// Helper function to parse the generated content
function parseGeneratedContent(text) {
  const parsedContent = {
    summary: "",
    chapters: [],
    flashcards: [],
    mcqs: [],
    qnas: []
  };

  // Extract summary
  const summaryMatch = text.match(/# SUMMARY\s*\n([\s\S]*?)(?=\n# |\n## |$)/i);
  if (summaryMatch && summaryMatch[1]) {
    parsedContent.summary = summaryMatch[1].trim();
  }

  // Extract chapters
  const chaptersSection = text.match(/# CHAPTERS\s*\n([\s\S]*?)(?=\n# |$)/i);
  if (chaptersSection && chaptersSection[1]) {
    const chaptersText = chaptersSection[1];
    const chapterBlocks = chaptersText.split(/\n(?=## )/g);
    
    parsedContent.chapters = chapterBlocks.map((block, index) => {
      const titleMatch = block.match(/## (.*)/);
      const title = titleMatch ? titleMatch[1].trim() : `Chapter ${index + 1}`;
      const content = block.replace(/## .*\n/, '').trim();
      
      return {
        title,
        content,
        order_number: index + 1
      };
    });
  }

  // Extract flashcards
  const flashcardsSection = text.match(/# FLASHCARDS\s*\n([\s\S]*?)(?=\n# |$)/i);
  if (flashcardsSection && flashcardsSection[1]) {
    const flashcardsText = flashcardsSection[1];
    const flashcardMatches = [...flashcardsText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
    
    parsedContent.flashcards = flashcardMatches.map((match) => ({
      question: match[1].trim(),
      answer: match[2].trim()
    }));
  }

  // Extract MCQs
  const mcqsSection = text.match(/# MCQs[\s\S]*?(?:Multiple Choice Questions\)?)?\s*\n([\s\S]*?)(?=\n# |$)/i);
  if (mcqsSection && mcqsSection[1]) {
    const mcqsText = mcqsSection[1];
    const mcqBlocks = mcqsText.split(/\n(?=- Question: )/g);
    
    parsedContent.mcqs = mcqBlocks.filter(block => block.includes('- Question:')).map(block => {
      const questionMatch = block.match(/- Question: ([\s\S]*?)(?=\n- Options:|\n|$)/);
      const optionsText = block.match(/- Options:\s*\n([\s\S]*?)(?=\n- Correct Answer:|\n|$)/);
      const correctAnswerMatch = block.match(/- Correct Answer: ([a-d])/i);
      
      const question = questionMatch ? questionMatch[1].trim() : '';
      
      let options = [];
      if (optionsText && optionsText[1]) {
        options = optionsText[1]
          .split(/\n\s*/)
          .filter(line => /^[a-d]\)/.test(line))
          .map(line => line.replace(/^[a-d]\)\s*/, '').trim());
      }
      
      const correctAnswer = correctAnswerMatch ? 
        options[correctAnswerMatch[1].charCodeAt(0) - 'a'.charCodeAt(0)] : 
        '';
      
      return {
        question,
        options,
        correct_answer: correctAnswer
      };
    });
  }

  // Extract Q&As
  const qnasSection = text.match(/# Q&A PAIRS\s*\n([\s\S]*?)(?=\n# |$)/i);
  if (qnasSection && qnasSection[1]) {
    const qnasText = qnasSection[1];
    const qnaMatches = [...qnasText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
    
    parsedContent.qnas = qnaMatches.map((match) => ({
      question: match[1].trim(),
      answer: match[2].trim()
    }));
  }

  return parsedContent;
}
