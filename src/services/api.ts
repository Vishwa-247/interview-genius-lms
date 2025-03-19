
import { supabase } from '@/integrations/supabase/client';
import { 
  CourseType, 
  ChapterType, 
  FlashcardType, 
  McqType, 
  QnaType, 
  MockInterviewType,
  InterviewQuestionType,
  InterviewAnalysisType
} from '@/types';

// Course related functions
export const createCourse = async (
  title: string, 
  purpose: CourseType['purpose'], 
  difficulty: CourseType['difficulty'],
  summary?: string
): Promise<CourseType> => {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title,
      purpose,
      difficulty,
      summary,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as CourseType;
};

export const getUserCourses = async (): Promise<CourseType[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CourseType[];
};

export const getCourseById = async (id: string): Promise<CourseType> => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as CourseType;
};

// Chapter related functions
export const createChapters = async (
  courseId: string, 
  chapters: Omit<ChapterType, 'id' | 'course_id' | 'created_at' | 'updated_at'>[]
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
  return data as ChapterType[];
};

export const getChaptersByCourseId = async (courseId: string): Promise<ChapterType[]> => {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as ChapterType[];
};

// Flashcard related functions
export const createFlashcards = async (
  courseId: string,
  flashcards: Omit<FlashcardType, 'id' | 'course_id' | 'created_at'>[]
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
  return data as FlashcardType[];
};

export const getFlashcardsByCourseId = async (courseId: string): Promise<FlashcardType[]> => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as FlashcardType[];
};

// MCQ related functions
export const createMCQs = async (
  courseId: string,
  mcqs: Omit<McqType, 'id' | 'course_id' | 'created_at'>[]
): Promise<McqType[]> => {
  const mcqsWithCourseId = mcqs.map(mcq => ({
    ...mcq,
    course_id: courseId,
    options: JSON.stringify(mcq.options) // Convert array to JSON string for Supabase
  }));

  const { data, error } = await supabase
    .from('mcqs')
    .insert(mcqsWithCourseId)
    .select();

  if (error) throw error;
  return data as McqType[];
};

export const getMCQsByCourseId = async (courseId: string): Promise<McqType[]> => {
  const { data, error } = await supabase
    .from('mcqs')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  
  // Parse JSON options back to arrays
  return data.map(mcq => ({
    ...mcq,
    options: JSON.parse(mcq.options)
  })) as McqType[];
};

// Q&A related functions
export const createQnAs = async (
  courseId: string,
  qnas: Omit<QnaType, 'id' | 'course_id' | 'created_at'>[]
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
  return data as QnaType[];
};

export const getQnAsByCourseId = async (courseId: string): Promise<QnaType[]> => {
  const { data, error } = await supabase
    .from('qna')
    .select('*')
    .eq('course_id', courseId);

  if (error) throw error;
  return data as QnaType[];
};

// Mock Interview related functions
export const createMockInterview = async (
  jobRole: string,
  techStack: string,
  experience: string
): Promise<MockInterviewType> => {
  const { data, error } = await supabase
    .from('mock_interviews')
    .insert({
      job_role: jobRole,
      tech_stack: techStack,
      experience: experience,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data as MockInterviewType;
};

export const getUserMockInterviews = async (): Promise<MockInterviewType[]> => {
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MockInterviewType[];
};

export const getMockInterviewById = async (id: string): Promise<MockInterviewType> => {
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MockInterviewType;
};

export const updateMockInterviewCompleted = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('mock_interviews')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
};

// Interview questions related functions
export const createInterviewQuestions = async (
  interviewId: string,
  questions: Omit<InterviewQuestionType, 'id' | 'interview_id' | 'created_at'>[]
): Promise<InterviewQuestionType[]> => {
  const questionsWithInterviewId = questions.map(question => ({
    ...question,
    interview_id: interviewId
  }));

  const { data, error } = await supabase
    .from('interview_questions')
    .insert(questionsWithInterviewId)
    .select();

  if (error) throw error;
  return data as InterviewQuestionType[];
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('interview_id', interviewId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data as InterviewQuestionType[];
};

export const updateInterviewQuestionAnswer = async (
  questionId: string, 
  answer: string
): Promise<void> => {
  const { error } = await supabase
    .from('interview_questions')
    .update({ user_answer: answer })
    .eq('id', questionId);

  if (error) throw error;
};

// Interview analysis related functions
export const createInterviewAnalysis = async (
  interviewId: string,
  facialExpressionData: InterviewAnalysisType['facial_expression_data'],
  pronunciationFeedback: string,
  technicalFeedback: string,
  languageFeedback: string,
  courseRecommendations: InterviewAnalysisType['course_recommendations']
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
  return data as InterviewAnalysisType;
};

export const getInterviewAnalysisByInterviewId = async (interviewId: string): Promise<InterviewAnalysisType> => {
  const { data, error } = await supabase
    .from('interview_analysis')
    .select('*')
    .eq('interview_id', interviewId)
    .single();

  if (error) throw error;
  return data as InterviewAnalysisType;
};

// Gemini API related functions
export const generateCourseContent = async (
  topic: string,
  purpose: CourseType['purpose'],
  difficulty: CourseType['difficulty']
) => {
  const response = await supabase.functions.invoke('gemini-api', {
    body: {
      action: 'generate_course',
      data: {
        topic,
        purpose,
        difficulty
      }
    }
  });

  if (response.error) throw response.error;
  return response.data;
};

export const generateInterviewQuestions = async (
  jobRole: string,
  techStack: string,
  experience: string,
  questionCount: number = 5
) => {
  const response = await supabase.functions.invoke('gemini-api', {
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

  if (response.error) throw response.error;
  return response.data;
};

export const analyzeInterviewResponse = async (
  jobRole: string,
  question: string,
  answer: string
) => {
  const response = await supabase.functions.invoke('gemini-api', {
    body: {
      action: 'analyze_interview',
      data: {
        jobRole,
        question,
        answer
      }
    }
  });

  if (response.error) throw response.error;
  return response.data;
};
