
import { useState } from "react";
import { Mic, MessageSquare, Video, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import GlassMorphism from "@/components/ui/GlassMorphism";
import InterviewSetup from "@/components/interview/InterviewSetup";
import VideoRecorder from "@/components/interview/VideoRecorder";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface InterviewQuestion {
  id: number;
  question: string;
  type: "technical" | "behavioral";
}

interface InterviewResponse {
  questionId: number;
  answer: string;
  videoBlob?: Blob;
}

interface InterviewFeedback {
  accuracy: number;
  communication: number;
  structure: number;
  feedback: string;
  strengthPoints: string[];
  improvementAreas: string[];
}

const MockInterview = () => {
  const [step, setStep] = useState<"setup" | "interview" | "feedback">("setup");
  const [profile, setProfile] = useState<{
    role: string;
    techStack: string;
    experience: string;
  } | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  // Mock interview questions
  const [questions] = useState<InterviewQuestion[]>([
    {
      id: 1,
      question: "Can you explain your approach to solving complex problems in your previous role?",
      type: "behavioral",
    },
    {
      id: 2,
      question: "Describe a challenging project you worked on and how you contributed to its success.",
      type: "behavioral",
    },
    {
      id: 3,
      question: "What are the key considerations when designing a scalable system architecture?",
      type: "technical",
    },
  ]);
  
  const handleProfileSubmit = (role: string, techStack: string, experience: string) => {
    setProfile({ role, techStack, experience });
    setStep("interview");
  };
  
  const handleNextQuestion = () => {
    // Save current response
    if (currentAnswer.trim()) {
      setResponses([
        ...responses,
        {
          questionId: questions[currentQuestionIndex].id,
          answer: currentAnswer,
        },
      ]);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
    } else {
      // Generate feedback
      generateFeedback();
    }
  };
  
  const handleRecordingComplete = (blob: Blob) => {
    // Update the current response with video blob
    const updatedResponses = [...responses];
    const currentResponse = updatedResponses.find(
      (r) => r.questionId === questions[currentQuestionIndex].id
    );
    
    if (currentResponse) {
      currentResponse.videoBlob = blob;
    } else {
      updatedResponses.push({
        questionId: questions[currentQuestionIndex].id,
        answer: currentAnswer,
        videoBlob: blob,
      });
    }
    
    setResponses(updatedResponses);
  };
  
  const generateFeedback = () => {
    // Simulate API call to generate feedback
    setTimeout(() => {
      const mockFeedback: InterviewFeedback = {
        accuracy: 85,
        communication: 78,
        structure: 90,
        feedback:
          "Overall, you demonstrated strong technical knowledge and good communication skills. Your answers were well-structured and provided concrete examples to support your points.",
        strengthPoints: [
          "Clear articulation of complex technical concepts",
          "Good use of specific examples from past experiences",
          "Structured responses with logical flow",
        ],
        improvementAreas: [
          "Could provide more quantitative results when discussing achievements",
          "Consider speaking at a slightly slower pace during technical explanations",
          "Expand on how you've handled challenges or conflicts",
        ],
      };
      
      setFeedback(mockFeedback);
      setStep("feedback");
    }, 1500);
  };
  
  const renderProgressBar = () => {
    return (
      <div className="w-full bg-secondary rounded-full h-2.5 mb-6">
        <div
          className="bg-primary h-2.5 rounded-full"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32">
        <Container>
          {step === "setup" && (
            <>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                  AI-Powered <span className="text-gradient">Mock Interview</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Practice with our intelligent AI interviewer and receive detailed
                  feedback to improve your interview skills.
                </p>
              </div>
              
              <InterviewSetup onSubmit={handleProfileSubmit} />
            </>
          )}
          
          {step === "interview" && profile && (
            <div className="max-w-4xl mx-auto">
              {renderProgressBar()}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <GlassMorphism className="p-6" intensity="medium">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-secondary rounded-md">
                          {questions[currentQuestionIndex].type === "technical"
                            ? "Technical"
                            : "Behavioral"}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-medium">
                        {questions[currentQuestionIndex].question}
                      </h2>
                    </div>
                  </GlassMorphism>
                  
                  <GlassMorphism className="p-6" intensity="medium">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Your Response</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mic size={16} />
                          <span>Voice or text</span>
                        </div>
                      </div>
                      
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type your answer here or record your response..."
                        className="w-full h-40 px-4 py-3 bg-white/20 dark:bg-black/20 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                      />
                      
                      <div className="flex justify-end">
                        <button
                          onClick={handleNextQuestion}
                          className="px-4 py-2 bg-primary text-white rounded-lg flex items-center space-x-2"
                        >
                          <span>
                            {currentQuestionIndex < questions.length - 1
                              ? "Next Question"
                              : "Finish Interview"}
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </GlassMorphism>
                </div>
                
                <div className="space-y-6">
                  <GlassMorphism className="p-6" intensity="medium">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Video Response</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Video size={16} />
                          <span>Optional</span>
                        </div>
                      </div>
                      
                      <VideoRecorder
                        onRecordingComplete={handleRecordingComplete}
                        isRecording={isRecording}
                        startRecording={() => setIsRecording(true)}
                        stopRecording={() => setIsRecording(false)}
                      />
                    </div>
                  </GlassMorphism>
                  
                  <GlassMorphism className="p-6" intensity="light">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Interview Tips</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <span className="text-primary pt-0.5">•</span>
                          <span>Speak clearly and maintain a steady pace</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-primary pt-0.5">•</span>
                          <span>Use the STAR method for behavioral questions</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-primary pt-0.5">•</span>
                          <span>Make eye contact with the camera when recording</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-primary pt-0.5">•</span>
                          <span>Provide specific examples to support your answers</span>
                        </li>
                      </ul>
                    </div>
                  </GlassMorphism>
                </div>
              </div>
            </div>
          )}
          
          {step === "feedback" && feedback && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Interview Feedback</h1>
                <p className="text-lg text-muted-foreground">
                  Here's our AI analysis of your interview performance
                </p>
              </div>
              
              <div className="space-y-8">
                <GlassMorphism className="p-8" intensity="medium">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">Performance Summary</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-6 bg-white/10 dark:bg-black/10 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {feedback.accuracy}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Technical Accuracy
                        </div>
                      </div>
                      
                      <div className="p-6 bg-white/10 dark:bg-black/10 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {feedback.communication}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Communication Skills
                        </div>
                      </div>
                      
                      <div className="p-6 bg-white/10 dark:bg-black/10 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {feedback.structure}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Answer Structure
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white/10 dark:bg-black/10 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">Overall Feedback</h3>
                      <p className="text-foreground">{feedback.feedback}</p>
                    </div>
                  </div>
                </GlassMorphism>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <GlassMorphism className="p-6" intensity="medium">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <span>Strengths</span>
                      </h3>
                      
                      <ul className="space-y-3">
                        {feedback.strengthPoints.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-white/10 dark:bg-black/10 rounded-lg"
                          >
                            <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">
                              +
                            </div>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassMorphism>
                  
                  <GlassMorphism className="p-6" intensity="medium">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                        </div>
                        <span>Areas for Improvement</span>
                      </h3>
                      
                      <ul className="space-y-3">
                        {feedback.improvementAreas.map((point, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-white/10 dark:bg-black/10 rounded-lg"
                          >
                            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs">
                              !
                            </div>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassMorphism>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setStep("setup");
                      setCurrentQuestionIndex(0);
                      setResponses([]);
                      setFeedback(null);
                      setCurrentAnswer("");
                    }}
                    className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Start New Interview
                  </button>
                  <button 
                    onClick={() => {
                      window.location.href = "/courses";
                    }}
                    className="px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    View Recommended Courses
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default MockInterview;
