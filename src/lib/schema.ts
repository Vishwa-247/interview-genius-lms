
import { pgTable, serial, text, varchar, timestamp, boolean, uuid, json, integer } from "drizzle-orm/pg-core";

// Mock Interview Tables
export const mockInterviews = pgTable("mock_interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull(),
  job_role: text("job_role").notNull(),
  tech_stack: text("tech_stack").notNull(),
  experience: text("experience").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  completed: boolean("completed").default(false),
});

export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  interview_id: uuid("interview_id").notNull(),
  question: text("question").notNull(),
  user_answer: text("user_answer"),
  order_number: integer("order_number").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const interviewAnalysis = pgTable("interview_analysis", {
  id: uuid("id").defaultRandom().primaryKey(),
  interview_id: uuid("interview_id").notNull(),
  facial_data: json("facial_data"),
  pronunciation_feedback: text("pronunciation_feedback"),
  technical_feedback: text("technical_feedback"),
  language_feedback: text("language_feedback"),
  recommendations: json("recommendations"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// User Tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  is_member: boolean("is_member").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Schema definition from your provided code
export const userAnswers = pgTable("user_answers", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockId").notNull(),
  question: varchar("question").notNull(),
  correctAns: text("correctAns"),
  userAns: text("userAns"),
  feedback: text("feedback"),
  rating: varchar("rating"),
  userEmail: varchar("userEmail"),
  createdAt: varchar("createdAt"),
});

// We'll add LMS schemas when you provide them
