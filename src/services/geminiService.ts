
import { FLASK_API_URL } from '@/configs/environment';

/**
 * Service for interacting with the Gemini API via Flask API
 */

interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
  text?: string; // Text property for Gemini responses
}

/**
 * Makes a call to the Gemini API via Flask API
 */
const callGeminiApi = async <T>(action: string, data: any): Promise<T> => {
  try {
    console.log(`Calling Gemini API via Flask API: ${action}`, data);
    
    // Add a timeout to the fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(`${FLASK_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Flask API error: ${response.status} ${errorText}`);
      throw new Error(`Flask API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`Received response from Gemini API via Flask: ${action}`, responseData);
    
    return responseData as unknown as T;
  } catch (error: any) {
    console.error(`Error calling Gemini API (${action}):`, error);
    return {
      success: false,
      error: error.message || 'Unknown error from Gemini API',
      text: 'Failed to generate content' // Provide a fallback text response
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
  topic: string,
  purpose: string,
  difficulty: string
): Promise<GeminiResponse> => {
  return callGeminiApi<GeminiResponse>('generate_flashcards', {
    topic,
    purpose,
    difficulty
  });
};

/**
 * Fallback function to generate course content directly in the frontend
 * This is used when the Flask API is not responding
 */
export const generateCourseFallback = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<GeminiResponse> => {
  try {
    // This is a simplified fallback that doesn't actually call Gemini
    // but provides a structure that matches what we'd expect from the API
    console.log("Using frontend fallback for course generation", { topic, purpose, difficulty });
    
    return {
      success: true,
      text: `# SUMMARY
This is a fallback-generated course on ${topic} for ${purpose} at ${difficulty} level.

# CHAPTERS
## Introduction to ${topic}
This chapter introduces the fundamental concepts of ${topic}.

## Core Principles
This chapter covers the core principles and methodologies.

## Advanced Techniques
This chapter explores more advanced techniques and applications.

## Practical Applications
This chapter demonstrates practical applications and use cases.

## Future Directions
This chapter discusses emerging trends and future directions.

# FLASHCARDS
- Question: What is ${topic}?
- Answer: ${topic} is a field that focuses on...

- Question: What are the core principles of ${topic}?
- Answer: The core principles include...

# MCQs (Multiple Choice Questions)
- Question: Which of the following best describes ${topic}?
- Options: 
a) A methodology for solving problems 
b) A theoretical framework 
c) A practical application 
d) All of the above
- Correct Answer: d

# Q&A PAIRS
- Question: How can ${topic} be applied in real-world scenarios?
- Answer: ${topic} can be applied in various ways including...`
    };
  } catch (error: any) {
    console.error("Error in fallback course generation:", error);
    return {
      success: false,
      error: error.message || "Fallback generation failed",
      text: "Failed to generate course content"
    };
  }
};
