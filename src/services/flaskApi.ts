
/**
 * Service for communicating with the Flask API for generation tasks
 */

/**
 * Base URL for the Flask API - replace with your actual Flask server URL
 * In development, you might be running the Flask server locally (e.g., http://localhost:5000)
 */
const FLASK_API_URL = "http://localhost:5000";

/**
 * Generate a complete course using the Flask API
 */
export const generateCourseWithFlask = async (
  topic: string,
  purpose: string,
  difficulty: string
) => {
  try {
    const response = await fetch(`${FLASK_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_course',
        topic,
        purpose,
        difficulty
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error generating course with Flask:", error);
    throw error;
  }
};

/**
 * Generate interview questions using the Flask API
 */
export const generateInterviewQuestionsWithFlask = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
) => {
  try {
    const response = await fetch(`${FLASK_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_interview_questions',
        jobRole,
        techStack,
        experience,
        questionCount
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error generating interview questions with Flask:", error);
    throw error;
  }
};

/**
 * Generate flashcards using the Flask API
 */
export const generateFlashcardsWithFlask = async (
  topic: string,
  purpose: string,
  difficulty: string
) => {
  try {
    // We can use the custom_content action for flashcard generation
    const prompt = `Generate 20 detailed flashcards on the topic: ${topic} for ${purpose} at ${difficulty} level.
                     
                     Create flashcards in this exact format:
                     
                     # FLASHCARDS
                     - Question: [Specific, clear question text]
                     - Answer: [Comprehensive, accurate answer text]
                     
                     Make sure the flashcards cover key concepts, terms, principles, and applications related to the topic.
                     Each answer should be detailed enough to provide complete understanding.
                     Ensure varying difficulty levels across the flashcards to test different aspects of knowledge.`;

    const response = await fetch(`${FLASK_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'custom_content',
        prompt
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error generating flashcards with Flask:", error);
    throw error;
  }
};

/**
 * Summarize text using the Flask API
 */
export const summarizeTextWithFlask = async (text: string) => {
  try {
    const response = await fetch(`${FLASK_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'summarize_text',
        text
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error summarizing text with Flask:", error);
    throw error;
  }
};

/**
 * Explain code using the Flask API
 */
export const explainCodeWithFlask = async (code: string) => {
  try {
    const response = await fetch(`${FLASK_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'explain_code',
        code
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Flask API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error explaining code with Flask:", error);
    throw error;
  }
};
