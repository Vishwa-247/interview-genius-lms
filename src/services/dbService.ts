
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

// Current user handling (replace with your auth solution)
const getCurrentUserId = async (): Promise<string> => {
  // Replace this with your new auth solution
  // This is a placeholder - you'll need to implement your actual auth logic
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
  
  const interview = {
    id,
    user_id: userId,
    job_role: jobRole,
    tech_stack: techStack,
    experience,
    completed: false,
    created_at: new Date()
  };
  
  await db.insert(schema.mockInterviews).values(interview);
  
  return interview;
};

export const getUserMockInterviews = async (): Promise<MockInterviewType[]> => {
  const userId = await getCurrentUserId();
  
  const interviews = await db
    .select()
    .from(schema.mockInterviews)
    .where(eq(schema.mockInterviews.user_id, userId))
    .orderBy(schema.mockInterviews.created_at);
    
  return interviews;
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
  
  return interview;
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
  const interviewQuestionsToInsert = questions.map(q => ({
    id: generateUuid(),
    interview_id: interviewId,
    question: q.question,
    order_number: q.order_number,
    user_answer: null,
    created_at: new Date()
  }));
  
  await db.insert(schema.interviewQuestions).values(interviewQuestionsToInsert);
  
  return interviewQuestionsToInsert;
};

export const getInterviewQuestionsByInterviewId = async (interviewId: string): Promise<InterviewQuestionType[]> => {
  const questions = await db
    .select()
    .from(schema.interviewQuestions)
    .where(eq(schema.interviewQuestions.interview_id, interviewId))
    .orderBy(schema.interviewQuestions.order_number);
    
  return questions;
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
  const analysis = {
    id: generateUuid(),
    interview_id: interviewId,
    facial_data: facialExpressionData,
    pronunciation_feedback: pronunciationFeedback,
    technical_feedback: technicalFeedback,
    language_feedback: languageFeedback,
    recommendations: courseRecommendations,
    created_at: new Date()
  };
  
  await db.insert(schema.interviewAnalysis).values(analysis);
  
  return analysis;
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
  
  return analysis;
};

// We'll implement the course and flashcard methods when you provide the LMS schema
