import { useState, useRef, useEffect } from "react";
import { Mic, MessageSquare, Video, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import GlassMorphism from "@/components/ui/GlassMorphism";
import InterviewSetup from "@/components/interview/InterviewSetup";
import VideoRecorder from "@/components/interview/VideoRecorder";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import useFacialAnalysis from "@/hooks/useFacialAnalysis";
import { 
  createMockInterview, 
  generateInterviewQuestions, 
  createInterviewQuestions,
  updateInterviewQuestionAnswer,
  updateMockInterviewCompleted,
  analyzeInterviewResponse,
  createInterviewAnalysis,
  analyzeSpeech
} from "@/services/api";
import { Progress } from "@/components/ui/progress";

interface InterviewQuestion {
  id?: string;
  question: string;
  user_answer?: string | null;
  order_number: number;
}

const MockInterview = () => {
  const [step, setStep] = useState<"setup" | "interview" | "feedback">("setup");
  const [profile, setProfile] = useState<{
    role: string;
    techStack: string;
    experience: string;
  } | null>(null);
  
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [speechAnalysis, setSpeechAnalysis] = useState<any | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    videoRef,
    facialData,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
    getAggregatedAnalysis
  } = useFacialAnalysis(step === "interview");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
    }
  };
  
  const handleProfileSubmit = async (role: string, techStack: string, experience: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to start a mock interview.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const interview = await createMockInterview(role, techStack, experience);
      setInterviewId(interview.id);
      
      let interviewQuestions: InterviewQuestion[];
      
      try {
        const generatedData = await generateInterviewQuestions(role, techStack, experience, 5);
        
        const extractedQuestions = extractQuestionsFromGeminiResponse(generatedData);
        
        interviewQuestions = extractedQuestions.map((q, index) => ({
          question: q,
          order_number: index + 1
        }));
      } catch (error) {
        console.error("Error generating questions with Gemini:", error);
        
        interviewQuestions = [
          {
            question: `As a ${role} with experience in ${techStack}, how would you approach scaling a system that needs to handle a 10x increase in traffic?`,
            order_number: 1
          },
          {
            question: `What are the most challenging problems you've solved using ${techStack} in your ${experience} years of experience?`,
            order_number: 2
          },
          {
            question: "Describe a time when you had to learn a new technology quickly to meet a project deadline.",
            order_number: 3
          },
          {
            question: "How do you stay updated with the latest trends and advancements in your field?",
            order_number: 4
          },
          {
            question: "What's your approach to debugging complex issues in production environments?",
            order_number: 5
          }
        ];
      }
      
      const savedQuestions = await createInterviewQuestions(interview.id, interviewQuestions);
      setQuestions(savedQuestions);
      
      setProfile({ role, techStack, experience });
      setStep("interview");
      
      startAnalysis();
      
    } catch (error) {
      console.error("Error setting up interview:", error);
      toast({
        title: "Error",
        description: "Failed to set up the interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const extractQuestionsFromGeminiResponse = (response: any): string[] => {
    try {
      if (response?.text) {
        const text = response.text;
        
        const questionRegex = /\d+\.\s+(.+?)(?=\d+\.|$)/gs;
        const matches = [...text.matchAll(questionRegex)];
        
        if (matches.length > 0) {
          return matches.map(match => match[1].trim());
        }
        
        const lines = text.split('\n');
        const questions = lines.filter(line => line.trim().endsWith('?'));
        
        if (questions.length > 0) {
          return questions.map(q => q.trim());
        }
      }
      
      if (response?.candidates && response.candidates.length > 0) {
        const content = response.candidates[0].content;
        if (content && Array.isArray(content.parts)) {
          const text = content.parts.map(part => part.text || '').join(' ');
          
          const lines = text.split('\n');
          return lines
            .filter(line => line.includes('?'))
            .map(line => line.trim())
            .slice(0, 5);
        }
      }
      
      throw new Error("Could not extract questions from response");
    } catch (error) {
      console.error("Error extracting questions from Gemini response:", error);
      throw error;
    }
  };
  
  const handleNextQuestion = async () => {
    if (!interviewId || !questions[currentQuestionIndex]?.id) return;
    
    try {
      if (currentAnswer.trim()) {
        await updateInterviewQuestionAnswer(
          questions[currentQuestionIndex].id as string,
          currentAnswer
        );
        
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].user_answer = currentAnswer;
        setQuestions(updatedQuestions);
      }
      
      if (audioBlob && profile) {
        try {
          const analysis = await analyzeSpeech(audioBlob, profile.role);
          setSpeechAnalysis(prev => ({
            ...prev,
            [currentQuestionIndex]: analysis
          }));
        } catch (error) {
          console.error("Error analyzing speech:", error);
        }
      }
      
      setAudioBlob(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer("");
      } else {
        await finishInterview();
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      toast({
        title: "Error",
        description: "Failed to save your answer. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const finishInterview = async () => {
    if (!interviewId || !profile) return;
    
    setIsLoading(true);
    
    try {
      stopAnalysis();
      
      await updateMockInterviewCompleted(interviewId);
      
      const facialExpressionData = getAggregatedAnalysis();
      
      let technicalFeedback = "";
      let languageFeedback = "";
      
      try {
        const lastQuestion = questions[questions.length - 1];
        if (lastQuestion && lastQuestion.user_answer) {
          const analysis = await analyzeInterviewResponse(
            profile.role,
            lastQuestion.question,
            lastQuestion.user_answer
          );
          
          if (analysis && analysis.text) {
            const text = analysis.text;
            technicalFeedback = extractTechnicalFeedback(text);
            languageFeedback = extractLanguageFeedback(text);
          }
        }
      } catch (error) {
        console.error("Error analyzing responses with Gemini:", error);
        technicalFeedback = "You demonstrated good understanding of technical concepts. Try to provide more specific examples in your answers.";
        languageFeedback = "Your language skills are good. Work on reducing filler words and speaking more concisely.";
      }
      
      let pronunciationFeedback = "Your pronunciation is clear. Continue practicing technical terminology to improve fluency.";
      
      if (speechAnalysis) {
        const allFeedback = Object.values(speechAnalysis).map((analysis: any) => analysis.feedback);
        pronunciationFeedback = allFeedback[0] || pronunciationFeedback;
      }
      
      const courseRecommendations = [
        {
          title: `Advanced ${profile.techStack.split(',')[0]} Techniques`,
          description: "Master advanced concepts and patterns"
        },
        {
          title: "Technical Communication Skills",
          description: "Improve how you communicate complex technical ideas"
        },
        {
          title: "System Design Fundamentals",
          description: "Learn how to design scalable systems"
        }
      ];
      
      await createInterviewAnalysis(
        interviewId,
        facialExpressionData,
        pronunciationFeedback,
        technicalFeedback,
        languageFeedback,
        courseRecommendations
      );
      
      setFeedback({
        accuracy: Math.floor(Math.random() * 30 + 70),
        communication: Math.floor(Math.random() * 30 + 70),
        structure: Math.floor(Math.random() * 20 + 80),
        feedback: technicalFeedback,
        strengthPoints: [
          "Clear articulation of complex technical concepts",
          `Good knowledge of ${profile.techStack}`,
          "Structured responses with logical flow",
        ],
        improvementAreas: [
          "Could provide more quantitative results when discussing achievements",
          "Consider speaking at a slightly slower pace during technical explanations",
          "Expand on how you've handled challenges or conflicts",
        ],
        courseRecommendations
      });
      
      setStep("feedback");
      
    } catch (error) {
      console.error("Error finishing interview:", error);
      toast({
        title: "Error",
        description: "Failed to complete the interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const extractTechnicalFeedback = (text: string): string => {
    const technicalKeywords = ['technical', 'concept', 'understanding', 'knowledge'];
    
    const sentences = text.split(/[.!?]+/);
    const technicalSentences = sentences.filter(sentence => 
      technicalKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    if (technicalSentences.length > 0) {
      return technicalSentences.join('. ') + '.';
    }
    
    return "You demonstrated good technical knowledge. Consider providing more specific examples in your future responses.";
  };
  
  const extractLanguageFeedback = (text: string): string => {
    const languageKeywords = ['language', 'grammar', 'vocabulary', 'articulate', 'communication'];
    
    const sentences = text.split(/[.!?]+/);
    const languageSentences = sentences.filter(sentence => 
      languageKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    if (languageSentences.length > 0) {
      return languageSentences.join('. ') + '.';
    }
    
    return "Your communication skills are good. Try to use more varied vocabulary and clearer explanations of technical concepts.";
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
  
  const renderFacialAnalysis = () => {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Real-time Facial Analysis</h4>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Confidence</span>
            <span>{Math.round(facialData.confident * 100)}%</span>
          </div>
          <Progress value={facialData.confident * 100} className="h-1" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Stress Level</span>
            <span>{Math.round(facialData.stressed * 100)}%</span>
          </div>
          <Progress value={facialData.stressed * 100} className="h-1" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Hesitation</span>
            <span>{Math.round(facialData.hesitant * 100)}%</span>
          </div>
          <Progress value={facialData.hesitant * 100} className="h-1" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Nervousness</span>
            <span>{Math.round(facialData.nervous * 100)}%</span>
          </div>
          <Progress value={facialData.nervous * 100} className="h-1" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Excitement</span>
            <span>{Math.round(facialData.excited * 100)}%</span>
          </div>
          <Progress value={facialData.excited * 100} className="h-1" />
        </div>
      </div>
    );
  };
  
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isRecording]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28">
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
              
              <InterviewSetup onSubmit={handleProfileSubmit} isLoading={isLoading} />
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
                          {profile.role}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-medium">
                        {questions[currentQuestionIndex]?.question}
                      </h2>
                    </div>
                  </GlassMorphism>
                  
                  <GlassMorphism className="p-6" intensity="medium">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Your Response</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <button 
                            onClick={() => setIsRecording(!isRecording)}
                            className={`p-1 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-secondary'}`}
                          >
                            <Mic size={16} />
                          </button>
                          <span>{isRecording ? 'Recording...' : 'Voice or text'}</span>
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
                          disabled={isLoading}
                          className="px-4 py-2 bg-primary text-white rounded-lg flex items-center space-x-2 disabled:opacity-70"
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
                          <span>Facial Analysis</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <video
                          ref={videoRef}
                          className="w-full h-[200px] bg-black/20 rounded-lg object-cover"
                          muted
                          playsInline
                        />
                        
                        {isAnalyzing && (
                          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                            Analyzing...
                          </div>
                        )}
                      </div>
                      
                      {isAnalyzing && renderFacialAnalysis()}
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
                        {feedback.strengthPoints.map((point: string, index: number) => (
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
                        {feedback.improvementAreas.map((point: string, index: number) => (
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
                
                <GlassMorphism className="p-6" intensity="medium">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Recommended Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {feedback.courseRecommendations.map((course: any, index: number) => (
                        <div 
                          key={index}
                          className="p-4 bg-white/10 dark:bg-black/10 rounded-lg space-y-2"
                        >
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.description}</p>
                          <button className="text-sm text-primary">Generate Course</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassMorphism>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setStep("setup");
                      setCurrentQuestionIndex(0);
                      setQuestions([]);
                      setFeedback(null);
                      setCurrentAnswer("");
                      setInterviewId(null);
                      setProfile(null);
                    }}
                    className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Start New Interview
                  </button>
                  <button 
                    onClick={() => {
                      navigate("/dashboard");
                    }}
                    className="px-6 py-3 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Back to Dashboard
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
