
import { GEMINI_API_KEY, COURSE_PROMPT_TEMPLATE, INTERVIEW_QUESTIONS_PROMPT_TEMPLATE } from '@/configs/environment';

/**
 * Service for interacting with the Gemini API directly
 */

interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
  text?: string; // Text property for Gemini responses
}

/**
 * Makes a call directly to the Gemini API
 */
const callGeminiApi = async <T>(action: string, data: any): Promise<T> => {
  try {
    console.log(`Calling Gemini API directly: ${action}`, data);
    
    // Verify API key is available
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your environment variables.');
      throw new Error('API key is required for Gemini API calls. Please check your environment configuration.');
    }
    
    // Add a timeout to the fetch to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    // Create the prompt based on the action and template
    let prompt = '';
    
    switch (action) {
      case 'generate_course':
        prompt = COURSE_PROMPT_TEMPLATE
          .replace('{topic}', data.topic)
          .replace('{purpose}', data.purpose)
          .replace('{difficulty}', data.difficulty);
        break;
      
      case 'generate_interview_questions':
        prompt = INTERVIEW_QUESTIONS_PROMPT_TEMPLATE
          .replace('{jobRole}', data.jobRole)
          .replace('{techStack}', data.techStack)
          .replace('{experience}', data.experience)
          .replace('{questionCount}', data.questionCount || '5');
        break;
      
      case 'analyze_interview':
        prompt = `Analyze this interview response for a ${data.jobRole} position.
                  Question: ${data.question}
                  Answer: ${data.answer}
                  
                  Provide feedback on:
                  1. Technical accuracy
                  2. Communication clarity
                  3. Relevance to the question
                  4. Areas of improvement`;
        break;
      
      case 'generate_flashcards':
        prompt = `Create a set of flashcards about "${data.topic}" for ${data.purpose} purpose at ${data.difficulty} level.
                  Format each flashcard as:
                  - Question: [Question]
                  - Answer: [Answer]`;
        break;
      
      default:
        prompt = `Please respond to: ${JSON.stringify(data)}`;
    }
    
    // Select the appropriate model based on the action
    const model = action === 'generate_course' ? 'gemini-1.5-flash' : 'gemini-1.0-pro';
    
    // API call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`Received response from Gemini API: ${action}`);
    
    // Extract text from Gemini response
    let text = '';
    try {
      text = responseData.candidates[0].content.parts[0].text || '';
    } catch (error) {
      console.error("Error extracting text from Gemini response:", error);
      throw new Error("Unable to extract text from Gemini response");
    }
    
    return {
      success: true,
      text,
      data: responseData
    } as unknown as T;
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
 * This is used when the Gemini API is not responding
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
