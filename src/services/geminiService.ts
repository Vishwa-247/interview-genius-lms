
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for interacting with the Gemini API via Supabase Edge Functions
 */

interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Makes a call to the Gemini API via Supabase Edge Functions
 */
const callGeminiApi = async <T>(action: string, data: any): Promise<T> => {
  try {
    console.log(`Calling Gemini API via Edge Function: ${action}`, data);
    
    // Call the Supabase Edge Function
    const { data: responseData, error } = await supabase.functions.invoke('gemini-api', {
      body: { action, data },
    });

    if (error) {
      console.error(`Supabase Edge Function error: ${error.message}`, error);
      throw new Error(`Supabase Edge Function error: ${error.message}`);
    }

    console.log(`Received response from Gemini API: ${action}`, responseData);
    
    if (!responseData.success) {
      throw new Error(responseData.error || 'Unknown error from Gemini API');
    }

    return responseData.data as T;
  } catch (error: any) {
    console.error(`Error calling Gemini API (${action}):`, error);
    throw error;
  }
};

/**
 * Generate a complete course using the Gemini API
 */
export const generateCourseWithGemini = async (
  courseId: string,
  topic: string,
  purpose: string,
  difficulty: string
): Promise<GeminiResponse> => {
  return callGeminiApi<GeminiResponse>('generate_course', {
    courseId,
    topic,
    purpose,
    difficulty
  });
};

/**
 * Generate interview questions using the Gemini API
 */
export const generateInterviewQuestionsWithGemini = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
): Promise<GeminiResponse> => {
  return callGeminiApi<GeminiResponse>('generate_interview_questions', {
    jobRole,
    techStack,
    experience,
    questionCount
  });
};

/**
 * Analyze an interview response using the Gemini API
 */
export const analyzeInterviewResponseWithGemini = async (
  jobRole: string,
  question: string,
  answer: string
): Promise<GeminiResponse> => {
  return callGeminiApi<GeminiResponse>('analyze_interview', {
    jobRole,
    question,
    answer
  });
};

/**
 * Generate flashcards using the Gemini API
 */
export const generateFlashcardsWithGemini = async (
  courseId: string,
  topic: string,
  purpose: string,
  difficulty: string
): Promise<GeminiResponse> => {
  return callGeminiApi<GeminiResponse>('generate_flashcards', {
    courseId,
    topic,
    purpose,
    difficulty
  });
};
