
import { db } from "@/lib/db";
import * as schema from "@/lib/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import { 
  CourseType, 
  ChapterType, 
  FlashcardType, 
  McqType, 
  QnaType, 
  MockInterviewType, 
  InterviewQuestionType, 
  InterviewAnalysisType 
} from "@/types";

// Helper function to create UUID
const generateUuid = () => uuidv4();

// Helper function to format Date objects to strings
const formatDate = (date: Date): string => {
  return date.toISOString();
};

// Current user handling
const getCurrentUserId = async (): Promise<string> => {
  // Get user from localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    return user.id;
  }
  return "placeholder-user-id";
};

// Mock Interview Methods
export const createMockInterview = async (
  jobRole: string,
  techStack: string,
  experience: string
): Promise<MockInterviewType> => {
  const userId = await getCurrentUserId();
  const id = generateUuid();
  const now = new Date();
  
  const interview = {
    id,
    user_id: userId,
    job_role: jobRole,
    tech_stack: techStack,
    experience,
    completed: false,
    created_at: now
  };
  
  await db.insert(schema.mockInterviews).values({
    id,
    user_id: userId,
    job_role: jobRole,
    tech_stack: techStack,
    experience,
    completed: false,
    // created_at is managed by defaultNow()
  });
  
  return {
    ...interview,
    created_at: formatDate(now)
  };
};

export const getUserMockInterviews = async (): Promise<MockInterviewType[]> => {
  const userId = await getCurrentUserId();
  
  const interviews = await db
    .select()
    .from(schema.mockInterviews)
    .where(eq(schema.mockInterviews.user_id, userId))
    .orderBy(schema.mockInterviews.created_at);
    
  return interviews.map(interview => ({
    ...interview,
    created_at: formatDate(interview.created_at as unknown as Date)
  }));
};

export const getMockInterviewById = async (interviewId: string): Promise<MockInterviewType> => {
  const interview = await db
    .select()
    .from(schema.mockInterviews)
    .where(eq(schema.mockInterviews.id, interviewId))
    .then(rows => rows[0]);
    
  if (!interview) {
    throw new Error(`Interview not found with id: ${interviewId}`);
  }
  
  return {
    ...interview,
    created_at: formatDate(interview.created_at as unknown as Date)
  };
};

export const updateMockInterviewCompleted = async (interviewId: string): Promise<void> => {
  await db
    .update(schema.mockInterviews)
    .set({ completed: true })
    .where(eq(schema.mockInterviews.id, interviewId));
};

// Interview Questions Methods
export const createInterviewQuestions = async (
  interviewId: string,
  questions: {
    question: string;
    order_number: number;
  }[]
): Promise<InterviewQuestionType[]> => {
  const now = new Date();
  const interviewQuestionsToInsert = questions.map(q => ({
    id: generateUuid(),
    interview_id: interviewId,
    question: q.question,
    order_number: q.order_number,
    user_answer: null,
    // created_at is managed by defaultNow()
  }));
  
  // Remove the user_answer field if it's null to prevent errors
  const questionsToInsert = interviewQuestionsToInsert.map(({ user_answer, ...rest }) => {
    if (user_answer !== null) {
      return { ...rest, user_answer };
    }
    return rest;
  });
  
  await db.insert(schema.interviewQuestions).values(questionsToInsert);
  
  return interviewQuestionsToInsert.map(q => ({
    ...q,
    created_at: formatDate(now)
  }));
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  const questions = await db
    .select()
    .from(schema.interviewQuestions)
    .where(eq(schema.interviewQuestions.interview_id, interviewId))
    .orderBy(schema.interviewQuestions.order_number);
    
  return questions.map(question => ({
    ...question,
    created_at: formatDate(question.created_at as unknown as Date)
  }));
};

export const updateInterviewQuestionAnswer = async (questionId: string, answer: string): Promise<void> => {
  await db
    .update(schema.interviewQuestions)
    .set({ user_answer: answer })
    .where(eq(schema.interviewQuestions.id, questionId));
};

// Interview Analysis Methods
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
  const now = new Date();
  const id = generateUuid();
  
  await db.insert(schema.interviewAnalysis).values({
    id,
    interview_id: interviewId,
    facial_data: facialExpressionData,
    pronunciation_feedback: pronunciationFeedback,
    technical_feedback: technicalFeedback,
    language_feedback: languageFeedback,
    recommendations: courseRecommendations,
    // created_at is managed by defaultNow()
  });
  
  return {
    id,
    interview_id: interviewId,
    facial_data: facialExpressionData,
    pronunciation_feedback: pronunciationFeedback,
    technical_feedback: technicalFeedback,
    language_feedback: languageFeedback,
    recommendations: courseRecommendations,
    created_at: formatDate(now)
  };
};

export const getInterviewAnalysisByInterviewId = async (interviewId: string): Promise<InterviewAnalysisType> => {
  const analysis = await db
    .select()
    .from(schema.interviewAnalysis)
    .where(eq(schema.interviewAnalysis.interview_id, interviewId))
    .then(rows => rows[0]);
    
  if (!analysis) {
    throw new Error(`Analysis not found for interview with id: ${interviewId}`);
  }
  
  // Ensure facial_data and recommendations conform to expected types
  const typedFacialData = analysis.facial_data as {
    confident: number;
    stressed: number;
    hesitant: number;
    nervous: number;
    excited: number;
  };
  
  const typedRecommendations = analysis.recommendations as {
    title: string;
    description: string;
    link?: string;
  }[];
  
  return {
    ...analysis,
    facial_data: typedFacialData,
    recommendations: typedRecommendations,
    created_at: formatDate(analysis.created_at as unknown as Date)
  };
};

// We'll implement the course and flashcard methods when you provide the LMS schema
