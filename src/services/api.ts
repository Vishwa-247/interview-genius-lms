
import { supabase } from '@/integrations/supabase/client';
import { CourseType, ChapterType, FlashcardType, McqType, QnaType, MockInterviewType, InterviewQuestionType, InterviewAnalysisType } from '@/types';

// More aggressive type assertion helper to work around typing issues with empty Database definition
const fromTable = <T>(tableName: string) => {
  // Using any type assertion to completely bypass TypeScript's type checking
  return (supabase as any).from(tableName);
};

// Course APIs
export const createCourse = async (
  title: string,
  purpose: CourseType['purpose'],
  difficulty: CourseType['difficulty'],
  summary: string,
  userId: string
): Promise<CourseType> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .insert({
      title,
      purpose,
      difficulty,
      summary,
      user_id: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data as CourseType;
};

export const getCourseById = async (courseId: string): Promise<CourseType> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data as CourseType;
};

export const getAllCourses = async (userId: string): Promise<CourseType[]> => {
  const { data, error } = await fromTable<CourseType>('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
  return data as CourseType[] || [];
};

// Added function for Dashboard.tsx
export const getUserCourses = async (): Promise<CourseType[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  
  return getAllCourses(userData.user.id);
};

// Chapter APIs
export const createChapters = async (
  courseId: string,
  chapters: { title: string; content: string; order_number: number }[]
): Promise<ChapterType[]> => {
  const chaptersWithCourseId = chapters.map(chapter => ({
    ...chapter,
    course_id: courseId
  }));

  const { data, error } = await fromTable<ChapterType>('chapters')
    .insert(chaptersWithCourseId)
    .select();

  if (error) throw error;
  return data as ChapterType[];
};

export const getChaptersByCourseId = async (courseId: string): Promise<ChapterType[]> => {
  const { data, error } = await fromTable<ChapterType>('chapters')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as ChapterType[];
};

// Flashcard APIs
export const createFlashcards = async (
  courseId: string,
  flashcards: { question: string; answer: string }[]
): Promise<FlashcardType[]> => {
  const flashcardsWithCourseId = flashcards.map(flashcard => ({
    ...flashcard,
    course_id: courseId
  }));

  const { data, error } = await fromTable<FlashcardType>('flashcards')
    .insert(flashcardsWithCourseId)
    .select();

  if (error) throw error;
  return data as FlashcardType[];
};

export const getFlashcardsByCourseId = async (courseId: string): Promise<FlashcardType[]> => {
  const { data, error } = await fromTable<FlashcardType>('flashcards')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as FlashcardType[];
};

// MCQ APIs
export const createMcqs = async (
  courseId: string,
  mcqs: { question: string; options: string[]; correct_answer: string }[]
): Promise<McqType[]> => {
  const mcqsWithCourseId = mcqs.map(mcq => ({
    course_id: courseId,
    question: mcq.question,
    options: mcq.options,
    correct_answer: mcq.correct_answer
  }));

  const { data, error } = await fromTable<McqType>('mcqs')
    .insert(mcqsWithCourseId)
    .select();

  if (error) throw error;
  return data as McqType[];
};

export const getMcqsByCourseId = async (courseId: string): Promise<McqType[]> => {
  const { data, error } = await fromTable<McqType>('mcqs')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  
  // Process the options back from JSON if needed
  return data as McqType[];
};

// Q&A APIs
export const createQnas = async (
  courseId: string,
  qnas: { question: string; answer: string }[]
): Promise<QnaType[]> => {
  const qnasWithCourseId = qnas.map(qna => ({
    ...qna,
    course_id: courseId
  }));

  const { data, error } = await fromTable<QnaType>('qna')
    .insert(qnasWithCourseId)
    .select();

  if (error) throw error;
  return data as QnaType[];
};

export const getQnasByCourseId = async (courseId: string): Promise<QnaType[]> => {
  const { data, error } = await fromTable<QnaType>('qna')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as QnaType[];
};

// Mock Interview APIs
export const createMockInterview = async (
  jobRole: string,
  techStack: string,
  experience: string
): Promise<MockInterviewType> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  const { data, error } = await fromTable<MockInterviewType>('mock_interviews')
    .insert({
      job_role: jobRole,
      tech_stack: techStack,
      experience: experience,
      user_id: userData.user.id,
      completed: false
    })
    .select()
    .single();

  if (error) throw error;
  return data as MockInterviewType;
};

// Added function for Dashboard.tsx
export const getUserMockInterviews = async (): Promise<MockInterviewType[]> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  
  const { data, error } = await fromTable<MockInterviewType>('mock_interviews')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching interviews:", error);
    return [];
  }
  return data as MockInterviewType[] || [];
};

export const getMockInterviewById = async (interviewId: string): Promise<MockInterviewType> => {
  const { data, error } = await fromTable<MockInterviewType>('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .single();

  if (error) throw error;
  return data as MockInterviewType;
};

export const updateMockInterviewCompleted = async (interviewId: string): Promise<void> => {
  const { error } = await fromTable<MockInterviewType>('mock_interviews')
    .update({
      completed: true
    })
    .eq('id', interviewId);

  if (error) throw error;
};

// Interview Questions APIs
export const createInterviewQuestions = async (
  interviewId: string,
  questions: {
    question: string;
    order_number: number;
  }[]
): Promise<InterviewQuestionType[]> => {
  const questionsWithInterviewId = questions.map(q => ({
    interview_id: interviewId,
    order_number: q.order_number,
    question: q.question,
    user_answer: null
  }));

  const { data, error } = await fromTable<InterviewQuestionType>('interview_questions')
    .insert(questionsWithInterviewId)
    .select();

  if (error) throw error;
  return data as InterviewQuestionType[];
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  const { data, error } = await fromTable<InterviewQuestionType>('interview_questions')
    .select('*')
    .eq('interview_id', interviewId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as InterviewQuestionType[];
};

export const updateInterviewQuestionAnswer = async (questionId: string, answer: string): Promise<void> => {
  const { error } = await fromTable<InterviewQuestionType>('interview_questions')
    .update({
      user_answer: answer
    })
    .eq('id', questionId);

  if (error) throw error;
};

// Interview Analysis APIs
export const createInterviewAnalysis = async (
  interviewId: string,
  facialExpressionData: {
    confident: number;
    stressed: number;
    hesitant: number;
    nervous: number;
    excited: number;
  },
  pronunciationFeedback: string,
  technicalFeedback: string,
  languageFeedback: string,
  courseRecommendations: {
    title: string;
    description: string;
    link?: string;
  }[]
): Promise<InterviewAnalysisType> => {
  const { data, error } = await fromTable<InterviewAnalysisType>('interview_analysis')
    .insert({
      interview_id: interviewId,
      facial_data: facialExpressionData,
      pronunciation_feedback: pronunciationFeedback,
      technical_feedback: technicalFeedback,
      language_feedback: languageFeedback,
      recommendations: courseRecommendations
    })
    .select()
    .single();

  if (error) throw error;
  return data as InterviewAnalysisType;
};

export const getInterviewAnalysisByInterviewId = async (interviewId: string): Promise<InterviewAnalysisType> => {
  const { data, error } = await fromTable<InterviewAnalysisType>('interview_analysis')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data as InterviewAnalysisType;
};

// Speech Analysis API - Added for communication skills analysis
export const analyzeSpeech = async (
  audioBlob: Blob,
  jobRole: string
): Promise<{
  clarity: number;
  confidence: number;
  fluency: number;
  accent: number;
  grammar: number;
  feedback: string;
}> => {
  // This will later integrate with the Flask API
  // For now, return mock data
  return {
    clarity: Math.random() * 60 + 40, // 40-100
    confidence: Math.random() * 60 + 40,
    fluency: Math.random() * 60 + 40,
    accent: Math.random() * 60 + 40,
    grammar: Math.random() * 60 + 40,
    feedback: "Your speech was clear, but try to slow down for technical explanations. Work on eliminating filler words like 'um' and 'ah'."
  };
};

// Future API endpoint for facial expression analysis that will connect to Flask
export const analyzeFacialExpression = async (
  imageBlob: Blob
): Promise<{
  confident: number;
  stressed: number;
  hesitant: number;
  nervous: number;
  excited: number;
}> => {
  // This will later integrate with the Flask API
  // For now, return mock data
  return {
    confident: Math.random() * 0.7 + 0.3, // Between 0.3 and 1.0
    stressed: Math.random() * 0.5,        // Between 0 and 0.5
    hesitant: Math.random() * 0.6,        // Between 0 and 0.6
    nervous: Math.random() * 0.4,         // Between 0 and 0.4
    excited: Math.random() * 0.5 + 0.2    // Between 0.2 and 0.7
  };
};

// Gemini API integration
export const generateCourseWithGemini = async (
  topic: string,
  purpose: CourseType['purpose'],
  difficulty: CourseType['difficulty']
) => {
  const { data, error } = await supabase.functions.invoke('gemini-api', {
    body: {
      action: 'generate_course',
      data: {
        topic,
        purpose,
        difficulty
      }
    }
  });

  if (error) throw error;
  return data;
};

// Function for CourseGenerator.tsx to replace missing generateCourseContent
export const generateCourseContent = async (
  topic: string, 
  purpose: CourseType['purpose'], 
  difficulty: CourseType['difficulty']
) => {
  return generateCourseWithGemini(topic, purpose, difficulty);
};

export const generateInterviewQuestions = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
) => {
  const { data, error } = await supabase.functions.invoke('gemini-api', {
    body: {
      action: 'generate_interview_questions',
      data: {
        jobRole,
        techStack,
        experience,
        questionCount
      }
    }
  });

  if (error) throw error;
  return data;
};

export const analyzeInterviewResponse = async (
  jobRole: string,
  question: string,
  answer: string
) => {
  const { data, error } = await supabase.functions.invoke('gemini-api', {
    body: {
      action: 'analyze_interview',
      data: {
        jobRole,
        question,
        answer
      }
    }
  });

  if (error) throw error;
  return data;
};
