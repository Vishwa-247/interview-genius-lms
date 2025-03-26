
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { CourseType } from "@/types";

// Define an interface for the content structure
interface CourseContent {
  status?: string;
  message?: string;
  lastUpdated?: string;
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
            } else if (content.status === 'error') {
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
      
      // Step 2: Call the Gemini API with the background course generation option
      console.log("Starting background generation for course ID:", emptyCourse.id);
      
      const { data: invokeFunctionData, error: invokeFunctionError } = await supabase.functions.invoke('gemini-api', {
        body: {
          action: 'generate_course',
          data: {
            courseId: emptyCourse.id,
            topic: courseName,
            purpose,
            difficulty
          }
        }
      });
      
      console.log("Function invoke response:", invokeFunctionData);
      
      if (invokeFunctionError) {
        console.error("Error invoking function:", invokeFunctionError);
        throw new Error(invokeFunctionError.message || "Failed to start course generation");
      }
      
      // Set generation as started
      setCourseGenerationId(emptyCourse.id);
      setGenerationInBackground(true);
      setError(null);
      
      return emptyCourse.id;
    } catch (error: any) {
      console.error("Error in startCourseGeneration:", error);
      throw error;
    }
  };

  return {
    generationInBackground,
    courseGenerationId,
    error,
    setError,
    startCourseGeneration
  };
};
