
import { GEMINI_API_KEY } from "@/configs/environment";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
const initializeGeminiAI = () => {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not found in environment variables");
    throw new Error("Gemini API key not configured");
  }
  
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

// Get a model instance with specified configuration
const getModel = (modelName = "gemini-2.0-flash-exp") => {
  const genAI = initializeGeminiAI();
  
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });
};

// Create a chat session
export const createChatSession = () => {
  const model = getModel();
  
  return model.startChat({
    history: [],
  });
};

/**
 * Generate course content
 */
export const generateCourseContent = async (
  topic: string, 
  purpose: string, 
  difficulty: string
): Promise<{ text: string }> => {
  const model = getModel();
  
  const prompt = `Create a complete course on ${topic} for ${purpose} at ${difficulty} level.
                   
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
                   - Answer: [comprehensive answer]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error("Error generating course content:", error);
    throw error;
  }
};

/**
 * Generate interview questions
 */
export const generateInterviewQuestions = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
): Promise<{ text: string }> => {
  const model = getModel();
  
  const prompt = `Generate ${questionCount} interview questions for a ${experience} years experienced ${jobRole} 
                   with expertise in ${techStack}. The questions should be challenging and relevant to the role.
                   
                   For each question:
                   1. Focus on both technical knowledge and practical application
                   2. Include questions that test problem-solving abilities
                   3. Add questions about handling specific scenarios they might encounter
                   4. Include questions about their approach to teamwork and collaboration
                   
                   Format the response as a numbered list with just the questions.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
};

/**
 * Analyze interview responses
 */
export const analyzeInterviewResponse = async (
  jobRole: string,
  question: string,
  answer: string
): Promise<{ text: string }> => {
  const model = getModel();
  
  const prompt = `Analyze this interview response for a ${jobRole} position. 
                   Question: ${question}
                   Answer: ${answer}
                   
                   Provide detailed analysis in the following format:
                   
                   Technical Feedback: (Analyze understanding of technical concepts and accuracy)
                   Communication Feedback: (Analyze clarity, structure, and language used)
                   Strengths: (List 3 specific strengths in the response)
                   Areas to Improve: (List 3 specific areas that could be improved)
                   Overall Rating: (Give a rating between 0-100)`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error("Error analyzing interview response:", error);
    throw error;
  }
};

/**
 * Generate flashcards
 */
export const generateFlashcards = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<{ text: string }> => {
  const model = getModel();
  
  const prompt = `Generate 20 detailed flashcards on the topic: ${topic} for ${purpose} at ${difficulty} level.
                   
                   Create flashcards in this exact format:
                   
                   # FLASHCARDS
                   - Question: [Specific, clear question text]
                   - Answer: [Comprehensive, accurate answer text]
                   
                   Make sure the flashcards cover key concepts, terms, principles, and applications related to the topic.
                   Each answer should be detailed enough to provide complete understanding.
                   Ensure varying difficulty levels across the flashcards to test different aspects of knowledge.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};

/**
 * Summarize text
 */
export const summarizeText = async (text: string): Promise<{ text: string }> => {
  const model = getModel();
  
  try {
    const result = await model.generateContent(`Summarize the following text in a concise manner:\n\n${text}`);
    const response = await result.response;
    const summary = response.text();
    
    return { text: summary };
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};

/**
 * Explain code
 */
export const explainCode = async (code: string): Promise<{ text: string }> => {
  const model = getModel();
  
  try {
    const result = await model.generateContent(`Explain the following code in detail:\n\n${code}`);
    const response = await result.response;
    const explanation = response.text();
    
    return { text: explanation };
  } catch (error) {
    console.error("Error explaining code:", error);
    throw error;
  }
};
