
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Container from "@/components/ui/Container";
import CourseForm from "@/components/course/CourseForm";
import HowItWorks from "@/components/course/HowItWorks";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/context/AuthContext";
import { toast as sonnerToast } from "sonner";
import { useCourseGeneration } from "@/hooks/useCourseGeneration";
import { CourseType } from "@/types";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    generationInBackground, 
    error, 
    setError, 
    startCourseGeneration 
  } = useCourseGeneration();

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
    
    try {
      toast({
        title: "Starting Course Generation",
        description: "This process will continue in the background. You can navigate to other pages.",
      });
      
      // Create the course entry and start generation in the background
      await startCourseGeneration(courseName, purpose, difficulty, user.id);
      
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
