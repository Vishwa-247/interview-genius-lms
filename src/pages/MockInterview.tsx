import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import InterviewSetup from "@/components/interview/InterviewSetup";
import VideoRecorder from "@/components/interview/VideoRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { InterviewQuestionType, MockInterviewType } from "@/types";
import Container from "@/components/ui/Container";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CourseForm from "@/components/course/CourseForm";

enum InterviewStage {
  Setup = "setup",
  Questions = "questions",
  Recording = "recording",
  Review = "review",
  Complete = "complete",
}

// Sample course generation data
const sampleCourseGenerationData = [
  {
    title: "React Fundamentals",
    purpose: "job_interview",
    difficulty: "intermediate",
    date: "15 minutes ago",
    status: "Generating...",
    progress: 65,
  },
  {
    title: "Data Structures and Algorithms",
    purpose: "exam",
    difficulty: "advanced",
    date: "2 hours ago",
    status: "Generated",
    progress: 100,
  },
  {
    title: "Machine Learning Basics",
    purpose: "practice",
    difficulty: "beginner",
    date: "Yesterday",
    status: "Generated",
    progress: 100,
  }
];

const MockInterview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<InterviewStage>(InterviewStage.Setup);
  const [interviewData, setInterviewData] = useState<MockInterviewType | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCourseTabActive, setIsCourseTabActive] = useState(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const sampleQuestions = [
    "Explain the concept of state management in React and compare different approaches.",
    "How would you optimize the performance of a React application?",
    "Can you explain the difference between controlled and uncontrolled components?",
    "What are React hooks and how do they work?",
    "How would you handle authentication in a React application?"
  ];

  const handleInterviewSetup = async (role: string, techStack: string, experience: string) => {
    setIsLoading(true);
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to start an interview",
          variant: "destructive",
        });
        return;
      }

      const { data: interviewData, error: interviewError } = await supabase
        .from('mock_interviews')
        .insert({
          user_id: user.id,
          job_role: role,
          tech_stack: techStack,
          experience: experience,
        })
        .select()
        .single();

      if (interviewError) throw interviewError;

      setInterviewData(interviewData);

      const generatedQuestions = sampleQuestions.map((question, index) => ({
        id: `q-${index}`,
        interview_id: interviewData.id,
        question: question,
        user_answer: null,
        order_number: index + 1,
        created_at: new Date().toISOString(),
      }));

      const { error: questionsError } = await supabase
        .from('interview_questions')
        .insert(generatedQuestions);

      if (questionsError) throw questionsError;

      await fetchInterviewQuestions(interviewData.id);
      
      setStage(InterviewStage.Questions);
      toast({
        title: "Interview Created",
        description: "Your mock interview has been set up successfully.",
      });
    } catch (error) {
      console.error("Error setting up interview:", error);
      toast({
        title: "Error",
        description: "Failed to set up the interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInterviewQuestions = async (interviewId: string) => {
    try {
      const { data, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_id', interviewId)
        .order('order_number', { ascending: true });

      if (error) throw error;
      
      setQuestions(data || []);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load interview questions.",
        variant: "destructive",
      });
    }
  };

  const handleAnswerSubmitted = (blob: Blob) => {
    toast({
      title: "Answer Recorded",
      description: "Your answer has been recorded successfully.",
    });
    
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStage(InterviewStage.Complete);
      
      setTimeout(() => {
        toast({
          title: "Interview Completed",
          description: "Your interview has been completed. Preparing your results...",
        });
        
        setTimeout(() => {
          navigate(`/interview-result/${interviewData?.id || '1'}`);
        }, 2000);
      }, 1000);
    }
  };

  const handleSubmitCourse = async (courseName: string, purpose: string, difficulty: string) => {
    setIsGeneratingCourse(true);
    
    setTimeout(() => {
      toast({
        title: "Course Generation Started",
        description: `Your course on ${courseName} is being generated. This may take a few minutes.`,
      });
      
      setTimeout(() => {
        setIsGeneratingCourse(false);
        toast({
          title: "Course Generated Successfully",
          description: "Your course is now ready to view!",
        });
      }, 3000);
    }, 1500);
  };

  const startRecording = () => {
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    setIsRecording(false);
  };
  
  const handleCancel = () => {
    setStage(InterviewStage.Questions);
  };

  const renderStage = () => {
    switch (stage) {
      case InterviewStage.Questions:
        if (questions.length === 0) {
          return (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading questions...</p>
            </div>
          );
        }
        
        return (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStage(InterviewStage.Setup)}
                className="text-muted-foreground"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Cancel Interview
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                <CardDescription>
                  Take a moment to think about your answer before recording.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-md text-lg">
                  {questions[currentQuestionIndex]?.question}
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-center my-8">
              <Button 
                size="lg"
                onClick={() => setStage(InterviewStage.Recording)}
              >
                Ready to Answer
              </Button>
            </div>
          </div>
        );
      
      case InterviewStage.Recording:
        return (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex]?.question}
              </h2>
              <p className="text-muted-foreground mb-4">
                When you're ready, click "Start Recording" and begin your answer. We'll analyze both your verbal response and facial expressions.
              </p>
            </div>
            
            <VideoRecorder 
              onRecordingComplete={handleAnswerSubmitted}
              isRecording={isRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
            />
            
            <div className="mt-6 flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        );
      
      case InterviewStage.Complete:
        return (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="mb-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Processing Your Interview</h2>
              <p className="text-muted-foreground">
                We're analyzing your responses and preparing your personalized feedback. You'll be redirected automatically when it's ready.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container className="py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isCourseTabActive ? "Course Generator" : "Mock Interview"}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {isCourseTabActive 
              ? "Create customized courses on any topic with our AI-powered course generator."
              : "Practice your interview skills with our AI-powered mock interview simulator."}
          </p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant={isCourseTabActive ? "outline" : "default"} 
            onClick={() => setIsCourseTabActive(false)}
          >
            Mock Interview
          </Button>
          <Button 
            variant={isCourseTabActive ? "default" : "outline"} 
            onClick={() => setIsCourseTabActive(true)}
          >
            Course Generator
          </Button>
        </div>
      </div>

      {isCourseTabActive ? (
        <div className="space-y-8">
          <CourseForm onSubmit={handleSubmitCourse} isLoading={isGeneratingCourse} />
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Recent Course Generations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleCourseGenerationData.map((course, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>{course.date}</CardDescription>
                      </div>
                      <div className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {course.purpose.replace('_', ' ')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">{course.difficulty}</span>
                      <span className="text-sm text-muted-foreground">{course.status}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        disabled={course.progress < 100}
                        onClick={() => navigate(`/course/${index}`)}
                      >
                        {course.progress < 100 ? "Generating..." : "View Course"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {stage === InterviewStage.Setup && (
            <div className="space-y-8">
              <InterviewSetup onSubmit={handleInterviewSetup} isLoading={isLoading} />
              
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Recent Mock Interviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <Card key={item} className="overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">Frontend Developer Interview</CardTitle>
                            <CardDescription>{item === 1 ? "2 hours ago" : item === 2 ? "Yesterday" : "3 days ago"}</CardDescription>
                          </div>
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
                            Completed
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-secondary">
                            React
                          </div>
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-secondary">
                            TypeScript
                          </div>
                          <div className="px-2 py-1 text-xs font-medium rounded-full bg-secondary">
                            {item === 1 ? "Node.js" : item === 2 ? "Redux" : "GraphQL"}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Score</span>
                          <span className={`text-sm font-bold ${
                            item === 1 ? "text-amber-500" : item === 2 ? "text-green-500" : "text-blue-500"
                          }`}>
                            {item === 1 ? "72%" : item === 2 ? "85%" : "78%"}
                          </span>
                        </div>
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => navigate(`/interview-result/${item}`)}
                          >
                            View Results
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {stage !== InterviewStage.Setup && renderStage()}
        </>
      )}
    </Container>
  );
};

export default MockInterview;

