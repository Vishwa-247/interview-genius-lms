
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { CourseType } from "@/types";
import { generateCourseWithFlask, generateFlashcardsWithFlask } from "@/services/flaskApi";
import { FLASK_API_URL } from "@/configs/environment";

// Define an interface for the content structure
interface CourseContent {
  status?: string;
  message?: string;
  lastUpdated?: string;
  parsedContent?: {
    summary?: string;
    chapters?: any[];
    flashcards?: any[];
    mcqs?: any[];
    qnas?: any[];
  };
  [key: string]: any;
}

export const useCourseGeneration = () => {
  const navigate = useNavigate();
  const [generationInBackground, setGenerationInBackground] = useState(false);
  const [courseGenerationId, setCourseGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: number | null = null;
    
    if (generationInBackground && courseGenerationId) {
      console.log("Setting up interval to check course generation status for ID:", courseGenerationId);
      
      intervalId = window.setInterval(async () => {
        try {
          console.log("Checking course generation status for ID:", courseGenerationId);
          const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseGenerationId)
            .single();
          
          if (error) {
            console.error("Error checking course status:", error);
            throw error;
          }
          
          console.log("Course status check result:", course?.content);
          
          // Type guard to ensure content is an object
          if (course && course.content && typeof course.content === 'object') {
            const content = course.content as CourseContent;
            
            // Check if course is fully complete
            if (content.status === 'complete') {
              console.log("Course generation completed!");
              if (intervalId) clearInterval(intervalId);
              setGenerationInBackground(false);
              setCourseGenerationId(null);
              
              sonnerToast.success('Course Generation Complete', {
                description: `Your course "${course.title}" has been generated successfully.`,
                action: {
                  label: 'View Course',
                  onClick: () => navigate(`/course/${course.id}`),
                },
              });
            } 
            // Check if we're generating additional resources like flashcards
            else if (content.status === 'generating_flashcards') {
              console.log("Generating additional flashcards for the course");
              // Continue checking, don't clear the interval
              
              // Show a toast notification about the ongoing flashcards generation
              if (content.message) {
                sonnerToast.info('Enhancing Your Course', {
                  description: content.message,
                });
              }
            }
            // Check if there was an error in generation
            else if (content.status === 'error') {
              console.error("Course generation failed:", content.message);
              if (intervalId) clearInterval(intervalId);
              setGenerationInBackground(false);
              setCourseGenerationId(null);
              
              sonnerToast.error('Course Generation Failed', {
                description: content.message || "An unknown error occurred",
              });
            }
          }
        } catch (error) {
          console.error("Error checking course generation status:", error);
          if (intervalId) clearInterval(intervalId);
          setGenerationInBackground(false);
          setCourseGenerationId(null);
          setError("Failed to check course generation status. Please try again.");
        }
      }, 5000);
    }
    
    return () => {
      if (intervalId) {
        console.log("Clearing interval for course generation check");
        clearInterval(intervalId);
      }
    };
  }, [generationInBackground, courseGenerationId, navigate]);

  // Create a function to start course generation
  const startCourseGeneration = async (
    courseName: string, 
    purpose: CourseType['purpose'], 
    difficulty: CourseType['difficulty'],
    userId: string
  ) => {
    try {
      console.log("Starting course generation for:", courseName);
      
      // Step 1: Create an empty course entry
      const { data: emptyCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseName,
          purpose,
          difficulty,
          user_id: userId,
          summary: "Course generation in progress...",
          content: { status: 'generating', lastUpdated: new Date().toISOString() }
        })
        .select()
        .single();
      
      if (courseError) {
        console.error("Error creating empty course:", courseError);
        throw new Error(courseError.message || "Failed to create course");
      }
      
      console.log("Created empty course:", emptyCourse);
      
      // Step 2: Start the background process to generate course content using Flask
      console.log("Starting background generation for course ID:", emptyCourse.id);

      // Set generation as started so the UI shows progress
      setCourseGenerationId(emptyCourse.id);
      setGenerationInBackground(true);
      setError(null);

      // Start the background process
      processBackgroundCourseGeneration(
        courseName,
        purpose,
        difficulty,
        emptyCourse.id
      );
      
      return emptyCourse.id;
    } catch (error: any) {
      console.error("Error in startCourseGeneration:", error);
      throw error;
    }
  };

  // Background processing function to handle course generation with Flask API
  const processBackgroundCourseGeneration = async (
    topic: string,
    purpose: CourseType['purpose'],
    difficulty: CourseType['difficulty'],
    courseId: string
  ) => {
    try {
      // Update course status to generating
      await supabase
        .from('courses')
        .update({ 
          content: { status: 'generating', lastUpdated: new Date().toISOString() } 
        })
        .eq('id', courseId);
        
      console.log(`Updated course ${courseId} status to generating`);
        
      // Call Flask API
      console.log(`Calling Flask API for course ${courseId}`);
      const responseData = await generateCourseWithFlask(topic, purpose, difficulty);
      
      console.log(`Background generation completed successfully for course ${courseId}`);
      
      // Extract text content
      const text = responseData.text();
      
      // Extract summary
      let summary = `An AI-generated course on ${topic}`;
      const summaryMatch = text.match(/SUMMARY[:\n]+([^#]+)/i);
      if (summaryMatch && summaryMatch[1]) {
        summary = summaryMatch[1].trim().substring(0, 500);
      }
      
      // Parse the content into structured format
      const parsedContent = parseGeneratedContent(text);
      
      // Update course with complete content
      await supabase
        .from('courses')
        .update({ 
          summary,
          content: {
            status: 'complete',
            fullText: text,
            generatedAt: new Date().toISOString(),
            parsedContent
          } 
        })
        .eq('id', courseId);
        
      console.log(`Course ${courseId} updated with generated content`);
      
      // After main course generation is complete, start flashcard generation as a separate background process
      // First, check if the parsed content has flashcards, if not, trigger separate flashcard generation
      if (!parsedContent.flashcards || parsedContent.flashcards.length < 5) {
        console.log(`Triggering separate flashcard generation for course ${courseId}`);
        
        try {
          // Get course details to pass to the flashcard generation
          const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('title, purpose, difficulty')
            .eq('id', courseId)
            .single();
            
          if (courseError) {
            throw new Error(`Error fetching course data: ${courseError.message}`);
          }
          
          // Start flashcard generation in background
          processBackgroundFlashcardsGeneration(
            courseData.title,
            courseData.purpose as CourseType['purpose'],
            courseData.difficulty as CourseType['difficulty'],
            courseId
          );
          
          console.log(`Successfully triggered flashcard generation for course ${courseId}`);
        } catch (flashcardError) {
          console.error(`Error triggering flashcard generation: ${flashcardError}`);
        }
      }
      
    } catch (error) {
      console.error(`Error in background processing for course ${courseId}:`, error);
      
      // Try to update the course with error status
      try {
        await supabase
          .from('courses')
          .update({ 
            content: { 
              status: 'error', 
              message: error.message || 'Unknown error during background processing',
              lastUpdated: new Date().toISOString()
            } 
          })
          .eq('id', courseId);
          
        console.log(`Updated course ${courseId} status to error due to background processing error`);
      } catch (updateError) {
        console.error(`Failed to update error status for course ${courseId}:`, updateError);
      }
    }
  };

  // Background processing function for flashcards generation with Flask API
  const processBackgroundFlashcardsGeneration = async (
    topic: string,
    purpose: CourseType['purpose'],
    difficulty: CourseType['difficulty'],
    courseId: string
  ) => {
    console.log(`Starting background flashcards generation for course ${courseId}`);
    
    try {
      // Update status that we're generating flashcards
      await supabase
        .from('courses')
        .update({ 
          content: { 
            status: 'generating_flashcards', 
            message: "Generating additional flashcards",
            lastUpdated: new Date().toISOString() 
          } 
        })
        .eq('id', courseId);
        
      // Call Flask API for flashcards
      console.log(`Calling Flask API for flashcards generation for course ${courseId}`);
      const responseData = await generateFlashcardsWithFlask(topic, purpose, difficulty);
      
      console.log(`Flashcards generation completed successfully for course ${courseId}`);
      
      // Extract text content
      const text = responseData.text();
      
      // Parse the flashcards
      const flashcardsSection = text.match(/# FLASHCARDS\s*\n([\s\S]*?)(?=\n# |$)/i);
      let flashcards = [];
      
      if (flashcardsSection && flashcardsSection[1]) {
        const flashcardsText = flashcardsSection[1];
        const flashcardMatches = [...flashcardsText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
        
        flashcards = flashcardMatches.map((match) => ({
          question: match[1].trim(),
          answer: match[2].trim()
        }));
      }
      
      if (flashcards.length > 0) {
        // First get the existing course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('content')
          .eq('id', courseId)
          .single();
          
        if (courseError) {
          throw new Error(`Error fetching course data: ${courseError.message}`);
        }
        
        // Extract the existing content
        const content = courseData.content || {};
        
        // Need to cast 'content' to our CourseContent type to ensure we can access parsedContent
        const typedContent = content as CourseContent;
        const parsedContent = typedContent.parsedContent || {};
        
        // Combine existing flashcards with new ones
        const existingFlashcards = parsedContent.flashcards || [];
        const combinedFlashcards = [...existingFlashcards, ...flashcards];
        
        // Update the course with the new flashcards
        await supabase
          .from('courses')
          .update({ 
            content: {
              ...typedContent,
              status: 'complete',
              lastUpdated: new Date().toISOString(),
              parsedContent: {
                ...parsedContent,
                flashcards: combinedFlashcards
              }
            }
          })
          .eq('id', courseId);
          
        console.log(`Updated course ${courseId} with ${flashcards.length} additional flashcards`);
        
        // Create flashcards table if it exists in the schema
        try {
          const flashcardsWithCourseId = flashcards.map(flashcard => ({
            ...flashcard,
            course_id: courseId
          }));
          
          // Check if the flashcards table exists before inserting
          const { data: tableInfo } = await supabase
            .from('flashcards')
            .select('*')
            .limit(1)
            .maybeSingle();
          
          // If we can query the table without errors, it exists
          if (tableInfo !== null || tableInfo === null) {  // Both cases mean the table exists
            const { error: insertError } = await supabase
              .from('flashcards')
              .insert(flashcardsWithCourseId);
              
            if (insertError) {
              console.error(`Error inserting flashcards into flashcards table: ${insertError.message}`);
            } else {
              console.log(`Successfully inserted ${flashcards.length} flashcards into flashcards table`);
            }
          } else {
            console.log("Flashcards table does not exist in schema, skipping direct insertion");
          }
        } catch (flashcardsTableError) {
          console.error("Error working with flashcards table:", flashcardsTableError);
          // Continue execution even if this fails - we already have flashcards in the course content
        }
      }
      
    } catch (error) {
      console.error(`Error in flashcards generation for course ${courseId}:`, error);
    }
  };

  // Function to generate additional flashcards for an existing course
  const generateAdditionalFlashcards = async (courseId: string, topic: string, purpose: CourseType['purpose'], difficulty: CourseType['difficulty']) => {
    try {
      console.log(`Generating additional flashcards for course ${courseId}`);
      
      // Update course status to indicate flashcard generation
      await supabase
        .from('courses')
        .update({ 
          content: { 
            status: 'generating_flashcards', 
            message: "Generating additional flashcards",
            lastUpdated: new Date().toISOString() 
          } 
        })
        .eq('id', courseId);
      
      // Start the background process
      processBackgroundFlashcardsGeneration(topic, purpose, difficulty, courseId);
      
      sonnerToast.info('Enhancing Your Course', {
        description: 'Generating additional flashcards for your course. This will happen in the background.',
      });
      
      return true;
    } catch (error: any) {
      console.error("Error in generateAdditionalFlashcards:", error);
      sonnerToast.error('Error', {
        description: error.message || "Failed to generate additional flashcards",
      });
      return false;
    }
  };

  // Helper function to parse the generated content
  const parseGeneratedContent = (text: string) => {
    const parsedContent = {
      summary: "",
      chapters: [],
      flashcards: [],
      mcqs: [],
      qnas: []
    };

    // Extract summary
    const summaryMatch = text.match(/# SUMMARY\s*\n([\s\S]*?)(?=\n# |\n## |$)/i);
    if (summaryMatch && summaryMatch[1]) {
      parsedContent.summary = summaryMatch[1].trim();
    }

    // Extract chapters
    const chaptersSection = text.match(/# CHAPTERS\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (chaptersSection && chaptersSection[1]) {
      const chaptersText = chaptersSection[1];
      const chapterBlocks = chaptersText.split(/\n(?=## )/g);
      
      parsedContent.chapters = chapterBlocks.map((block, index) => {
        const titleMatch = block.match(/## (.*)/);
        const title = titleMatch ? titleMatch[1].trim() : `Chapter ${index + 1}`;
        const content = block.replace(/## .*\n/, '').trim();
        
        return {
          title,
          content,
          order_number: index + 1
        };
      });
    }

    // Extract flashcards
    const flashcardsSection = text.match(/# FLASHCARDS\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (flashcardsSection && flashcardsSection[1]) {
      const flashcardsText = flashcardsSection[1];
      const flashcardMatches = [...flashcardsText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
      
      parsedContent.flashcards = flashcardMatches.map((match) => ({
        question: match[1].trim(),
        answer: match[2].trim()
      }));
    }

    // Extract MCQs
    const mcqsSection = text.match(/# MCQs[\s\S]*?(?:Multiple Choice Questions\)?)?\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (mcqsSection && mcqsSection[1]) {
      const mcqsText = mcqsSection[1];
      const mcqBlocks = mcqsText.split(/\n(?=- Question: )/g);
      
      parsedContent.mcqs = mcqBlocks.filter(block => block.includes('- Question:')).map(block => {
        const questionMatch = block.match(/- Question: ([\s\S]*?)(?=\n- Options:|\n|$)/);
        const optionsText = block.match(/- Options:\s*\n([\s\S]*?)(?=\n- Correct Answer:|\n|$)/);
        const correctAnswerMatch = block.match(/- Correct Answer: ([a-d])/i);
        
        const question = questionMatch ? questionMatch[1].trim() : '';
        
        let options = [];
        if (optionsText && optionsText[1]) {
          options = optionsText[1]
            .split(/\n\s*/)
            .filter(line => /^[a-d]\)/.test(line))
            .map(line => line.replace(/^[a-d]\)\s*/, '').trim());
        }
        
        const correctAnswer = correctAnswerMatch ? 
          options[correctAnswerMatch[1].charCodeAt(0) - 'a'.charCodeAt(0)] : 
          '';
        
        return {
          question,
          options,
          correct_answer: correctAnswer
        };
      });
    }

    // Extract Q&As
    const qnasSection = text.match(/# Q&A PAIRS\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (qnasSection && qnasSection[1]) {
      const qnasText = qnasSection[1];
      const qnaMatches = [...qnasText.matchAll(/- Question: ([\s\S]*?)- Answer: ([\s\S]*?)(?=\n- Question: |\n# |\n$)/g)];
      
      parsedContent.qnas = qnaMatches.map((match) => ({
        question: match[1].trim(),
        answer: match[2].trim()
      }));
    }

    return parsedContent;
  };

  return {
    generationInBackground,
    courseGenerationId,
    error,
    setError,
    startCourseGeneration,
    generateAdditionalFlashcards
  };
};
