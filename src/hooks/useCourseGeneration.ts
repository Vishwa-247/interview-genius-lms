
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
          if (course && course.content && typeof course.content === 'object' && !Array.isArray(course.content)) {
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

  const startCourseGeneration = (courseId: string) => {
    setCourseGenerationId(courseId);
    setGenerationInBackground(true);
    setError(null);
  };

  return {
    generationInBackground,
    courseGenerationId,
    error,
    setError,
    startCourseGeneration
  };
};
