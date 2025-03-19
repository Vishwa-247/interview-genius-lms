
import { supabase } from '@/integrations/supabase/client';
import { CourseType, ChapterType, FlashcardType, McqType, QnaType, MockInterviewType, InterviewQuestionType, InterviewAnalysisType } from '@/types';

// Use type assertions to work around type issues
// This creates a safe wrapper around the Supabase client for our needs

// Course APIs
export const createCourse = async (
  title: string,
  purpose: CourseType['purpose'],
  difficulty: CourseType['difficulty'],
  summary: string,
  userId: string
): Promise<CourseType> => {
  const { data, error } = await supabase
    .from('courses')
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
  return data as unknown as CourseType;
};

export const getCourseById = async (courseId: string): Promise<CourseType> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data as unknown as CourseType;
};

export const getAllCourses = async (userId: string): Promise<CourseType[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as CourseType[];
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

  const { data, error } = await supabase
    .from('chapters')
    .insert(chaptersWithCourseId)
    .select();

  if (error) throw error;
  return data as unknown as ChapterType[];
};

export const getChaptersByCourseId = async (courseId: string): Promise<ChapterType[]> => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as unknown as ChapterType[];
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

  const { data, error } = await supabase
    .from('flashcards')
    .insert(flashcardsWithCourseId)
    .select();

  if (error) throw error;
  return data as unknown as FlashcardType[];
};

export const getFlashcardsByCourseId = async (courseId: string): Promise<FlashcardType[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as unknown as FlashcardType[];
};

// MCQ APIs
export const createMcqs = async (
  courseId: string,
  mcqs: { question: string; options: string[]; correct_answer: string }[]
): Promise<McqType[]> => {
  // Convert string[] options to a JSON-compatible format for database storage
  const mcqsWithCourseId = mcqs.map(mcq => ({
    course_id: courseId,
    question: mcq.question,
    // Convert options array to JSON string for storage
    options: mcq.options,
    correct_answer: mcq.correct_answer
  }));

  const { data, error } = await supabase
    .from('mcqs')
    .insert(mcqsWithCourseId)
    .select();

  if (error) throw error;
  return data as unknown as McqType[];
};

export const getMcqsByCourseId = async (courseId: string): Promise<McqType[]> => {
  const { data, error } = await supabase
    .from('mcqs')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  
  // Process the options back from JSON if needed
  return data as unknown as McqType[];
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

  const { data, error } = await supabase
    .from('qna')
    .insert(qnasWithCourseId)
    .select();

  if (error) throw error;
  return data as unknown as QnaType[];
};

export const getQnasByCourseId = async (courseId: string): Promise<QnaType[]> => {
  const { data, error } = await supabase
    .from('qna')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as unknown as QnaType[];
};

// Mock Interview APIs
export const createMockInterview = async (
  jobRole: string,
  techStack: string,
  experience: string
): Promise<MockInterviewType> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('mock_interviews')
    .insert({
      job_role: jobRole,
      tech_stack: techStack,
      experience: experience,
      user_id: userData.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as MockInterviewType;
};

export const getMockInterviewById = async (interviewId: string): Promise<MockInterviewType> => {
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', interviewId)
    .single();

  if (error) throw error;
  return data as unknown as MockInterviewType;
};

export const updateMockInterviewCompleted = async (interviewId: string): Promise<void> => {
  const { error } = await supabase
    .from('mock_interviews')
    .update({
      completed_at: new Date().toISOString()
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
    user_answer: null as string | null // Make user_answer nullable to match our interface
  }));

  const { data, error } = await supabase
    .from('interview_questions')
    .insert(questionsWithInterviewId)
    .select();

  if (error) throw error;
  return data as unknown as InterviewQuestionType[];
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('interview_id', interviewId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as unknown as InterviewQuestionType[];
};

export const updateInterviewQuestionAnswer = async (questionId: string, answer: string): Promise<void> => {
  const { error } = await supabase
    .from('interview_questions')
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
  const { data, error } = await supabase
    .from('interview_analysis')
    .insert({
      interview_id: interviewId,
      facial_expression_data: facialExpressionData,
      pronunciation_feedback: pronunciationFeedback,
      technical_feedback: technicalFeedback,
      language_feedback: languageFeedback,
      course_recommendations: courseRecommendations
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as InterviewAnalysisType;
};

export const getInterviewAnalysisByInterviewId = async (interviewId: string): Promise<InterviewAnalysisType> => {
  const { data, error } = await supabase
    .from('interview_analysis')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data as unknown as InterviewAnalysisType;
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
