
// Environment variables
export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Log if Gemini API key is missing (for debugging)
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set in environment variables. Gemini API calls will fail.");
}

// Course generation prompt template
export const COURSE_PROMPT_TEMPLATE = `Create a complete course on {topic} for {purpose} at {difficulty} level.

Follow this exact structure:

# SUMMARY
Provide a concise overview of what the course covers and its objectives.

# CHAPTERS
Create 5-8 logically structured chapters. For each chapter:
## [Chapter Title]
[Chapter Content with detailed and comprehensive content including examples, explanations, and relevant concepts]

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

Ensure the course is educational, accurate, and tailored to the specified purpose and difficulty level.`;

// Interview questions prompt template
export const INTERVIEW_QUESTIONS_PROMPT_TEMPLATE = `Generate {questionCount} interview questions for a {experience} years experienced {jobRole} with expertise in {techStack}.

The questions should be challenging and relevant to the role, focusing on:
1. Technical knowledge and practical application
2. Problem-solving abilities
3. Scenario-based questions
4. Teamwork and collaboration skills

Format as a numbered list of questions.`;
