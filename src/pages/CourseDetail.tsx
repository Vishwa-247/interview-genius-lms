
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, Layout, Lightbulb, MessageSquare, ChevronLeft, CheckCircle2 } from "lucide-react";
import Container from "@/components/ui/Container";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChapterType, CourseType, FlashcardType, McqType, QnaType } from "@/types";
import { useAuth } from "@/context/AuthContext";

const EmptyState = ({ message, description }: { message: string, description: string }) => (
  <div className="text-center py-12">
    <div className="rounded-full w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-4">
      <BookOpen className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium mb-2">{message}</h3>
    <p className="text-muted-foreground max-w-md mx-auto mb-6">{description}</p>
    <Button asChild>
      <Link to="/course/generate">Generate a Course</Link>
    </Button>
  </div>
);

const renderMarkdown = (content: string) => {
  if (!content) return '';
  
  return content
    .replace(/^#\s(.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^##\s(.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
    .replace(/^###\s(.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    // Don't replace every line with <p> tags, only actual paragraphs
    .replace(/^(?!<h[1-6]|<pre|<code|<ul|<ol|<li|<p|<blockquote)(.+)$/gm, '<p class="my-3">$1</p>')
    .replace(/\`\`\`(.+?)\n([\s\S]*?)\`\`\`/g, '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code>$2</code></pre>')
    .replace(/\`([^\`]+)\`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
};

// Type guard to check if content is a valid object with parsedContent
const isValidContentObject = (content: any): content is { parsedContent: any } => {
  return content !== null && 
         typeof content === 'object' && 
         'parsedContent' in content && 
         content.parsedContent !== null;
};

const CourseDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseType | null>(null);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [mcqs, setMcqs] = useState<McqType[]>([]);
  const [qnas, setQnas] = useState<QnaType[]>([]);
  const [activeTab, setActiveTab] = useState("chapters");
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
          toast({
            title: "Error",
            description: "Could not fetch course data. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (!courseData) {
          setIsLoading(false);
          return;
        }
        
        setCourse(courseData as CourseType);
        
        // Process content from the course data - with better type checking
        if (courseData.content && isValidContentObject(courseData.content)) {
          const { parsedContent } = courseData.content;
          
          // Process chapters
          if (parsedContent.chapters && Array.isArray(parsedContent.chapters)) {
            const processedChapters = parsedContent.chapters.map((chapter, index) => ({
              id: `ch${index}`,
              course_id: id,
              title: chapter.title,
              content: chapter.content,
              order_number: chapter.order_number || index + 1,
              created_at: courseData.created_at,
              updated_at: courseData.created_at
            }));
            setChapters(processedChapters);
          }
          
          // Process flashcards
          if (parsedContent.flashcards && Array.isArray(parsedContent.flashcards)) {
            const processedFlashcards = parsedContent.flashcards.map((flashcard, index) => ({
              id: `f${index}`,
              course_id: id,
              question: flashcard.question,
              answer: flashcard.answer,
              created_at: courseData.created_at
            }));
            setFlashcards(processedFlashcards);
          }
          
          // Process MCQs
          if (parsedContent.mcqs && Array.isArray(parsedContent.mcqs)) {
            const processedMcqs = parsedContent.mcqs.map((mcq, index) => ({
              id: `m${index}`,
              course_id: id,
              question: mcq.question,
              options: mcq.options || ["Option A", "Option B", "Option C", "Option D"],
              correct_answer: mcq.correct_answer,
              created_at: courseData.created_at
            }));
            setMcqs(processedMcqs);
          }
          
          // Process Q&As
          if (parsedContent.qnas && Array.isArray(parsedContent.qnas)) {
            const processedQnas = parsedContent.qnas.map((qna, index) => ({
              id: `q${index}`,
              course_id: id,
              question: qna.question,
              answer: qna.answer,
              created_at: courseData.created_at
            }));
            setQnas(processedQnas);
          }
        } else {
          console.log("Course content is not in the expected format:", courseData.content);
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, toast]);

  const toggleAnswer = (id: string) => {
    setShowAnswer(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAnswer = (id: string, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [id]: option
    }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </Container>
    );
  }

  // If no course found
  if (!course) {
    return (
      <Container className="py-12">
        <EmptyState 
          message="Course not found" 
          description="The course you're looking for doesn't exist or has been removed."
        />
      </Container>
    );
  }

  const formatLabel = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <Container className="py-12">
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground mb-6 hover:text-primary transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="px-2 py-1">
            {formatLabel(course.purpose)}
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            {formatLabel(course.difficulty)}
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4">{course.title}</h1>
        
        {course.summary && (
          <p className="text-muted-foreground max-w-4xl mb-8">
            {course.summary}
          </p>
        )}
      </div>
      
      <Tabs 
        defaultValue="chapters" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="chapters" className="flex items-center">
            <Layout className="h-4 w-4 mr-2" />
            Chapters
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="mcq" className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
          <TabsTrigger value="qna" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Q&A
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chapters" className="space-y-6">
          {chapters.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {chapters.map((chapter) => (
                <Card key={chapter.id}>
                  <CardHeader>
                    <CardTitle className="flex items-start">
                      <span className="text-muted-foreground mr-4">
                        {String(chapter.order_number).padStart(2, '0')}
                      </span>
                      {chapter.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ 
                        __html: renderMarkdown(chapter.content)
                       }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No chapters yet" 
              description="This course doesn't have any chapters yet. Try generating a new course."
            />
          )}
        </TabsContent>
        
        <TabsContent value="flashcards" className="space-y-6">
          {flashcards.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {flashcards.map((flashcard) => (
                <Card key={flashcard.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-start">
                      <Lightbulb className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-1" />
                      <span>{flashcard.question}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <Button
                        variant={showAnswer[flashcard.id] ? "default" : "outline"}
                        onClick={() => toggleAnswer(flashcard.id)}
                        className="w-full"
                      >
                        {showAnswer[flashcard.id] ? "Hide Answer" : "Show Answer"}
                      </Button>
                    </div>
                    
                    {showAnswer[flashcard.id] && (
                      <div className="p-4 rounded-md bg-muted/50 animate-in fade-in-50 duration-200">
                        {flashcard.answer}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No flashcards yet" 
              description="This course doesn't have any flashcards yet. Try generating a new course."
            />
          )}
        </TabsContent>
        
        <TabsContent value="mcq" className="space-y-6">
          {mcqs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {mcqs.map((mcq) => (
                <Card key={mcq.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{mcq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mcq.options.map((option, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-md border cursor-pointer transition-colors ${
                            selectedAnswers[mcq.id] === option
                              ? selectedAnswers[mcq.id] === mcq.correct_answer
                                ? "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-300"
                                : "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-300"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => handleSelectAnswer(mcq.id, option)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {selectedAnswers[mcq.id] === option && (
                              selectedAnswers[mcq.id] === mcq.correct_answer ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <span className="text-red-500 font-medium">✕</span>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedAnswers[mcq.id] && selectedAnswers[mcq.id] !== mcq.correct_answer && (
                      <div className="mt-4 p-4 rounded-md bg-green-500/10 border border-green-500/30">
                        <p className="font-medium text-green-700 dark:text-green-300">
                          Correct answer: {mcq.correct_answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No quizzes yet" 
              description="This course doesn't have any quizzes yet. Try generating a new course."
            />
          )}
        </TabsContent>
        
        <TabsContent value="qna" className="space-y-6">
          {qnas.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {qnas.map((qna, index) => (
                <AccordionItem key={qna.id} value={qna.id}>
                  <AccordionTrigger className="text-left font-medium">
                    {qna.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-line">
                    {qna.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <EmptyState 
              message="No Q&A pairs yet" 
              description="This course doesn't have any Q&A pairs yet. Try generating a new course."
            />
          )}
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default CourseDetail;
