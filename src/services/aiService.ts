
import { GEMINI_API_KEY } from "@/configs/environment";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Gemini API with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
});

// Set up generation config for responses
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

// Create a chat session
export const createChatSession = () => {
  return model.startChat({
    generationConfig,
    history: [],
  });
};

// Generate content based on a prompt
export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw error;
  }
};

// Generate course content
export const generateCourseContent = async (
  topic: string,
  purpose: string,
  difficulty: string
): Promise<string> => {
  const prompt = `Create a comprehensive course on ${topic} for ${purpose} at ${difficulty} level. 
  Include chapters, key points, and practice questions.
  Format the response as a structured JSON with the following sections:
  {
    "title": "Course Title",
    "summary": "Brief overview",
    "chapters": [
      {
        "title": "Chapter Title",
        "content": "Chapter content in markdown format"
      }
    ],
    "flashcards": [
      {
        "question": "Question text",
        "answer": "Answer text"
      }
    ],
    "mcqs": [
      {
        "question": "Question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "correct_answer": "Correct option text"
      }
    ],
    "qnas": [
      {
        "question": "Question text",
        "answer": "Detailed answer text"
      }
    ]
  }`;

  return generateContent(prompt);
};

// Generate interview questions
export const generateInterviewQuestions = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
): Promise<string> => {
  const prompt = `Generate ${questionCount} technical interview questions for a ${jobRole} position 
  focusing on ${techStack} with ${experience} experience level.
  Format the response as a JSON array with questions:
  [
    {
      "question": "Question text",
      "order_number": 1
    },
    ...
  ]`;

  return generateContent(prompt);
};

// Analyze interview response
export const analyzeInterviewResponse = async (
  jobRole: string,
  question: string,
  answer: string
): Promise<string> => {
  const prompt = `Analyze this interview response for a ${jobRole} position. 
  Question: ${question}
  Answer: ${answer}
  
  Provide detailed analysis in the following format:
  
  Technical Feedback: (Analyze understanding of technical concepts and accuracy)
  Communication Feedback: (Analyze clarity, structure, and language used)
  Strengths: (List 3 specific strengths in the response)
  Areas to Improve: (List 3 specific areas that could be improved)
  Overall Rating: (Give a rating between 0-100)`;

  return generateContent(prompt);
};

export default {
  createChatSession,
  generateContent,
  generateCourseContent,
  generateInterviewQuestions,
  analyzeInterviewResponse,
};
