
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import { Loader2 } from "lucide-react";
import CourseForm from "@/components/course/CourseForm";
import { useAuth } from "@/context/AuthContext";
import { CourseType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generationInBackground, setGenerationInBackground] = useState(false);
  const [recentCourses, setRecentCourses] = useState<CourseType[]>([]);
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
          
          if (course && course.content && course.content.status === 'complete') {
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
          } else if (course && course.content && course.content.status === 'error') {
            console.error("Course generation failed:", course.content.message);
            if (intervalId) clearInterval(intervalId);
            setGenerationInBackground(false);
            setCourseGenerationId(null);
            
            sonnerToast.error('Course Generation Failed', {
              description: course.content.message || "An unknown error occurred",
            });
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
      
      setCourseGenerationId(emptyCourse.id);
      setGenerationInBackground(true);
      
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
      setGenerationInBackground(false);
      setCourseGenerationId(null);
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
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">How It Works</h2>
              <ol className="space-y-2 text-muted-foreground">
                <li className="flex gap-2 items-start">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                  <span>Enter the course topic or subject you want to learn about</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                  <span>Select the purpose of your learning and desired difficulty level</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                  <span>Our AI generates a complete course with chapters, flashcards, and quizzes</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
                  <span>Start learning at your own pace with your personalized course</span>
                </li>
              </ol>
              
              {generationInBackground && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm font-medium">Course generation in progress</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can navigate to other pages. We'll notify you when it's ready.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <h3 className="text-xl font-semibold">Starting Course Generation</h3>
            <p className="text-muted-foreground">
              We're preparing your course. Once started, you can navigate away and we'll notify you when it's ready.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CourseGenerator;
