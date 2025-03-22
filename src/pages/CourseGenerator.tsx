
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

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generationInBackground, setGenerationInBackground] = useState(false);
  const [recentCourses, setRecentCourses] = useState<CourseType[]>([]);
  const [courseGenerationId, setCourseGenerationId] = useState<string | null>(null);

  // Effect to check background generation status
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (generationInBackground && courseGenerationId) {
      // Poll for course generation completion every 5 seconds
      intervalId = window.setInterval(async () => {
        try {
          const { data: course, error } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseGenerationId)
            .single();
          
          if (error) throw error;
          
          // Check if content has been generated
          if (course && course.content) {
            // Clear the interval
            if (intervalId) clearInterval(intervalId);
            setGenerationInBackground(false);
            setCourseGenerationId(null);
            
            // Notify the user that generation is complete
            sonnerToast.success('Course Generation Complete', {
              description: `Your course "${course.title}" has been generated successfully.`,
              action: {
                label: 'View Course',
                onClick: () => navigate(`/course/${course.id}`),
              },
            });
          }
        } catch (error) {
          console.error("Error checking course generation status:", error);
        }
      }, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
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
    
    try {
      toast({
        title: "Starting Course Generation",
        description: "This process will continue in the background. You can navigate to other pages.",
      });

      console.log("Starting course generation for:", courseName);
      
      // First create an empty course record to track generation
      const { data: emptyCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseName,
          purpose,
          difficulty,
          user_id: user.id,
          summary: "Course generation in progress...",
          content: null
        })
        .select()
        .single();
      
      if (courseError) {
        throw courseError;
      }
      
      // Store the course ID for background status checking
      setCourseGenerationId(emptyCourse.id);
      
      // Set background generation flag
      setGenerationInBackground(true);
      
      // Start the API call in the background and don't wait for it
      generateCourseInBackground(emptyCourse.id, courseName, purpose, difficulty);
      
      // Add the empty course to recent courses
      setRecentCourses(prev => [emptyCourse as CourseType, ...prev]);
      
      // Allow the user to navigate away
      sonnerToast.info('Course Generation Started', {
        description: 'Your course is being generated in the background. You can continue browsing the site.',
        duration: 5000,
      });
      
      // Navigate to dashboard to show all courses including the in-progress one
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Error starting course generation:", error);
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

  // Function to handle background course generation
  const generateCourseInBackground = async (courseId: string, courseName: string, purpose: CourseType['purpose'], difficulty: CourseType['difficulty']) => {
    try {
      // The actual API call
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
        
        // Update the course with error status
        await supabase
          .from('courses')
          .update({
            summary: "Error generating course. Please try again.",
            content: { error: true }
          })
          .eq('id', courseId);
          
        return;
      }
      
      console.log("Course generation successful, processing response...");
      
      // Extract summary from the generated content
      let summary = "An AI-generated course on " + courseName;
      let content = null;
      
      try {
        const text = generatedData.data.candidates[0].content.parts[0].text;
        
        // Parse the full text into structured content
        const parsedContent = parseGeneratedContent(text);
        
        // Use the parsed summary or fallback
        summary = parsedContent.summary || summary;
        
        // Store the structured content instead of raw text
        content = {
          parsedContent,
          generatedAt: new Date().toISOString()
        };
        
        console.log("Content processed successfully, saving to database...");
      } catch (e) {
        console.error("Error extracting content:", e);
        content = { error: "Failed to parse content" };
      }
      
      // Update course in database with the generated content
      const { error: updateError } = await supabase
        .from('courses')
        .update({
          summary,
          content
        })
        .eq('id', courseId);
      
      if (updateError) {
        console.error("Error updating course with generated content:", updateError);
      }
      
    } catch (error: any) {
      console.error("Background generation error:", error);
      
      // Update the course with error status
      await supabase
        .from('courses')
        .update({
          summary: "Error generating course: " + (error.message || "Unknown error"),
          content: { error: true }
        })
        .eq('id', courseId);
    }
  };

  // Helper function to parse the generated content
  const parseGeneratedContent = (text: string) => {
    const parsedContent: any = {
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
      
      parsedContent.flashcards = flashcardMatches.map((match, index) => ({
        question: match[1].trim(),
        answer: match[2].trim()
      }));
    }

    // Extract MCQs
    const mcqsSection = text.match(/# MCQs[\s\S]*?Multiple Choice Questions\)?\s*\n([\s\S]*?)(?=\n# |$)/i);
    if (mcqsSection && mcqsSection[1]) {
      const mcqsText = mcqsSection[1];
      const mcqBlocks = mcqsText.split(/\n(?=- Question: )/g);
      
      parsedContent.mcqs = mcqBlocks.filter(block => block.includes('- Question:')).map(block => {
        const questionMatch = block.match(/- Question: ([\s\S]*?)(?=\n- Options:|\n|$)/);
        const optionsText = block.match(/- Options:\s*\n([\s\S]*?)(?=\n- Correct Answer:|\n|$)/);
        const correctAnswerMatch = block.match(/- Correct Answer: ([a-d])/i);
        
        const question = questionMatch ? questionMatch[1].trim() : '';
        
        let options: string[] = [];
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
      
      parsedContent.qnas = qnaMatches.map((match, index) => ({
        question: match[1].trim(),
        answer: match[2].trim()
      }));
    }

    return parsedContent;
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
