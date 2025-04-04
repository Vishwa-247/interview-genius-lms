
import { FLASK_API_URL } from '@/configs/environment';

/**
 * Service for interacting with the Gemini API via Flask API
 * This redirects all calls intended for Gemini to the Flask backend
 */

interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Makes a call to the Gemini API via Flask API
 */
const callGeminiApi = async <T>(action: string, data: any): Promise<T> => {
  try {
    console.log(`Calling Gemini API via Flask API: ${action}`, data);
    
    // Call the Flask API instead of Supabase Edge Functions
    const response = await fetch(`${FLASK_API_URL}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Flask API error: ${response.status} ${errorText}`);
      throw new Error(`Flask API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`Received response from Gemini API via Flask: ${action}`, responseData);
    
    return {
      success: true,
      data: responseData.data
    } as unknown as T;
  } catch (error: any) {
    console.error(`Error calling Gemini API (${action}):`, error);
    return {
      success: false,
      error: error.message || 'Unknown error from Gemini API'
    } as unknown as T;
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
