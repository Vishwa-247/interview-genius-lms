
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import { Loader2 } from "lucide-react";
import CourseForm from "@/components/course/CourseForm";
import { useAuth } from "@/context/AuthContext";
import { CourseType } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recentCourses, setRecentCourses] = useState<CourseType[]>([]);

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
    
    try {
      toast({
        title: "Generating Course",
        description: "Please wait while we create your course. This may take a minute.",
      });

      // Call the Gemini API through our Supabase Edge Function
      const { data: generatedData, error: generationError } = await supabase.functions.invoke('gemini-api', {
        body: {
          action: 'generate_course',
          data: {
            topic: courseName,
            purpose,
            difficulty
          }
        }
      });

      if (generationError || !generatedData || !generatedData.data) {
        console.error("Generation error:", generationError || "Failed to generate course content");
        throw new Error("Failed to generate course content");
      }
      
      console.log("Course generation successful:", generatedData);
      
      // Extract summary from the generated content
      let summary = "An AI-generated course on " + courseName;
      let content = null;
      
      try {
        const text = generatedData.data.candidates[0].content.parts[0].text;
        const summaryMatch = text.match(/SUMMARY[:\n]+([^#]+)/i);
        
        if (summaryMatch && summaryMatch[1]) {
          summary = summaryMatch[1].trim().substring(0, 500);
        }
        
        // Store the full content for later use
        content = {
          fullText: text,
          generatedAt: new Date().toISOString()
        };
        
      } catch (e) {
        console.error("Error extracting summary:", e);
      }
      
      // Create course in database
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseName,
          purpose,
          difficulty,
          content,
          user_id: user.id
        })
        .select()
        .single();
      
      if (courseError) {
        throw courseError;
      }
      
      console.log("Course saved to database:", course);
      
      // Update recent courses list with type assertion
      setRecentCourses(prev => [course as CourseType, ...prev]);
      
      toast({
        title: "Course Created!",
        description: "Your course has been generated successfully.",
      });
      
      // Navigate to the course detail page
      navigate(`/course/${course.id}`);
      
    } catch (error) {
      console.error("Error generating course:", error);
      toast({
        title: "Error",
        description: "Failed to generate course. Please try again later.",
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
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto" />
            <h3 className="text-xl font-semibold">Generating Your Course</h3>
            <p className="text-muted-foreground">
              Please wait while our AI creates your personalized course. This may take a minute or two.
            </p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default CourseGenerator;
