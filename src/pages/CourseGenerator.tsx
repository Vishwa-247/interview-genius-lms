
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import CourseForm from "@/components/course/CourseForm";
import HowItWorks from "@/components/course/HowItWorks";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/context/AuthContext";
import { CourseType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourseGeneration } from "@/hooks/useCourseGeneration";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recentCourses, setRecentCourses] = useState<CourseType[]>([]);
  
  // Use our custom hook
  const { 
    generationInBackground, 
    error, 
    setError, 
    startCourseGeneration 
  } = useCourseGeneration();

  const handleSubmit = async (courseName: string, purpose: CourseType['purpose'], difficulty: CourseType['difficulty']) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate courses.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      toast({
        title: "Starting Course Generation",
        description: "This process will continue in the background. You can navigate to other pages.",
      });

      console.log("Starting course generation for:", courseName);
      
      // Step 1: Create an empty course entry
      const { data: emptyCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseName,
          purpose,
          difficulty,
          user_id: user.id,
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
      
      // Start background tracking of course generation
      startCourseGeneration(emptyCourse.id);
      
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
      
      setRecentCourses(prev => [emptyCourse as CourseType, ...prev]);
      
      sonnerToast.info('Course Generation Started', {
        description: 'Your course is being generated in the background. You can continue browsing the site.',
        duration: 5000,
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Error starting course generation:", error);
      setError(error.message || "Failed to start course generation. Please try again later.");
      toast({
        title: "Error",
        description: error.message || "Failed to start course generation. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Course Generator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Create customized courses on any topic with our AI-powered course generator.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CourseForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
        
        <div>
          <HowItWorks generationInBackground={generationInBackground} />
        </div>
      </div>

      <LoadingOverlay 
        isLoading={isLoading}
        message="Starting Course Generation"
        subMessage="We're preparing your course. Once started, you can navigate away and we'll notify you when it's ready."
      />
    </Container>
  );
};

export default CourseGenerator;
