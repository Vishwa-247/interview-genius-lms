
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Container from "@/components/ui/Container";
import CourseForm from "@/components/course/CourseForm";
import HowItWorks from "@/components/course/HowItWorks";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { useCourseGeneration } from "@/hooks/useCourseGeneration";
import { CourseType } from "@/types";
import { useMutation } from "@tanstack/react-query";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    generationInBackground, 
    error, 
    progress,
    setError, 
    startCourseGeneration 
  } = useCourseGeneration();

  // Use React Query for mutations to manage loading and error states automatically
  const generateCourseMutation = useMutation({
    mutationFn: async ({
      courseName, 
      purpose, 
      difficulty
    }: {
      courseName: string;
      purpose: CourseType['purpose'];
      difficulty: CourseType['difficulty'];
    }) => {
      if (!user) {
        throw new Error("Authentication required");
      }
      return startCourseGeneration(courseName, purpose, difficulty, user.id);
    },
    onSuccess: () => {
      sonnerToast.info('Course Generation Started', {
        description: 'Your course is being generated in the background with advanced flashcards and interactive elements. You can continue browsing the site.',
        duration: 6000,
      });
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      console.error("Error starting course generation:", error);
      setError(error.message || "Failed to start course generation. Please try again later.");
      toast({
        title: "Error",
        description: error.message || "Failed to start course generation. Please try again later.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSubmit = async (
    courseName: string, 
    purpose: CourseType['purpose'], 
    difficulty: CourseType['difficulty']
  ) => {
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
    
    toast({
      title: "Starting Course Generation",
      description: "This process will continue in the background. You can navigate to other pages.",
    });
    
    // Use the mutation to handle the API call
    generateCourseMutation.mutate({ courseName, purpose, difficulty });
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

      {generationInBackground && (
        <div className="mb-8">
          <p className="text-sm font-medium mb-2">Generating your course...</p>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
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
