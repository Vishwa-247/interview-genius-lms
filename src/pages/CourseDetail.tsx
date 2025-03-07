
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Container from "@/components/ui/Container";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, FileText, Lightbulb, HelpCircle, CheckCircle } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("notes");

  // Mock data - would come from API in a real app
  const course = {
    id,
    title: "Advanced React Patterns and Performance Optimization",
    description: "Learn advanced React patterns and techniques to build scalable and performant applications.",
    progress: 65,
    createdAt: "2023-05-10",
    difficulty: "Advanced",
    notes: [
      {
        title: "Component Composition",
        content: "Component composition is a pattern where components are combined to create more complex UIs. This approach promotes reusability and separation of concerns. Unlike inheritance, composition allows for more flexible and maintainable code."
      },
      {
        title: "Render Props",
        content: "The render prop pattern involves passing a function as a prop to a component. This function returns a React element and allows the component to share code with the component that receives the prop. This is useful for cross-cutting concerns like data fetching and state management."
      },
      {
        title: "Custom Hooks",
        content: "Custom hooks allow you to extract component logic into reusable functions. Hooks should always start with 'use' and can call other hooks. They're a way to reuse stateful logic, not state itself."
      },
      {
        title: "Memoization",
        content: "Memoization is an optimization technique that stores the results of expensive function calls and returns the cached result when the same inputs occur again. In React, we use React.memo, useMemo, and useCallback for memoization."
      }
    ],
    flashcards: [
      { front: "What is component composition?", back: "A pattern where components are combined to create more complex UIs, promoting reusability and separation of concerns." },
      { front: "Explain the render props pattern", back: "A technique where a function prop is used to pass renderable elements to a component, allowing for code sharing and flexibility." },
      { front: "What are custom hooks?", back: "Functions that start with 'use' and allow you to extract and reuse component logic across multiple components." },
      { front: "What is memoization in React?", back: "An optimization technique that caches results of expensive calculations to prevent unnecessary re-renders." },
      { front: "What is the purpose of React.memo?", back: "A higher order component that memoizes a component to prevent re-renders if props haven't changed." }
    ],
    questions: [
      { 
        question: "What's the main advantage of component composition over inheritance?", 
        answer: "Component composition provides more flexibility and better separation of concerns. It allows for more granular reuse of UI and logic, whereas inheritance creates tight coupling and can lead to fragile component hierarchies." 
      },
      { 
        question: "How does the Context API help with prop drilling?", 
        answer: "Context provides a way to share values between components without explicitly passing props through every level of the component tree. This solves the prop drilling problem where props need to be passed through many intermediate components." 
      },
      { 
        question: "When should you use useMemo vs. useCallback?", 
        answer: "Use useMemo when you want to memoize a computed value to avoid expensive recalculations. Use useCallback when you want to memoize a function definition to prevent unnecessary re-renders of child components that receive the function as a prop." 
      }
    ],
    mcqs: [
      {
        question: "Which hook is used to perform side effects in function components?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctAnswer: "useEffect"
      },
      {
        question: "What is the purpose of the key prop in lists?",
        options: [
          "It's optional and just for debugging", 
          "It helps React identify which items have changed, are added, or removed", 
          "It defines the style of list items",
          "It determines the order of elements"
        ],
        correctAnswer: "It helps React identify which items have changed, are added, or removed"
      },
      {
        question: "Which of the following is NOT a rule of hooks?",
        options: [
          "Only call hooks at the top level", 
          "Only call hooks from custom hooks",
          "Only call hooks from React function components", 
          "Hooks can be called conditionally"
        ],
        correctAnswer: "Hooks can be called conditionally"
      }
    ]
  };

  // Flashcard state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // MCQ state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % course.flashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev === 0 ? course.flashcards.length - 1 : prev - 1));
  };

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const getScorePercentage = () => {
    if (Object.keys(selectedAnswers).length === 0) return 0;
    
    const correctCount = course.mcqs.reduce((count, mcq, index) => {
      return selectedAnswers[index] === mcq.correctAnswer ? count + 1 : count;
    }, 0);
    
    return Math.round((correctCount / course.mcqs.length) * 100);
  };

  return (
    <Container>
      <div className="py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BookOpen className="h-4 w-4" />
            <span>Course #{id}</span>
            <span>•</span>
            <span>{course.difficulty}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">{course.title}</h1>
          <p className="text-muted-foreground max-w-3xl">{course.description}</p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span>Your progress</span>
                <span className="font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
            <Button>Continue Learning</Button>
          </div>
        </div>

        <Tabs
          defaultValue="notes"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="flashcards">
              <Lightbulb className="h-4 w-4 mr-2" />
              Flashcards
            </TabsTrigger>
            <TabsTrigger value="qa">
              <HelpCircle className="h-4 w-4 mr-2" />
              Q&A
            </TabsTrigger>
            <TabsTrigger value="quiz">
              <CheckCircle className="h-4 w-4 mr-2" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            {course.notes.map((note, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-2xl font-semibold">{note.title}</h2>
                <p className="leading-relaxed text-foreground/90">{note.content}</p>
                {index < course.notes.length - 1 && <Separator />}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="flashcards">
            <div className="max-w-2xl mx-auto">
              <div 
                className={`relative h-64 w-full perspective-1000 cursor-pointer mb-6 ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className={`absolute w-full h-full transition-all duration-500 ${isFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100'}`}>
                  <Card className="w-full h-full flex flex-col justify-center items-center">
                    <CardContent className="pt-6 text-center text-xl">
                      {course.flashcards[currentCardIndex].front}
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                      Click to reveal answer
                    </CardFooter>
                  </Card>
                </div>
                <div className={`absolute w-full h-full transition-all duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0 rotate-y-180'}`}>
                  <Card className="w-full h-full flex flex-col justify-center items-center bg-muted/30">
                    <CardContent className="pt-6 text-center text-xl">
                      {course.flashcards[currentCardIndex].back}
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                      Click to see question
                    </CardFooter>
                  </Card>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePrevCard}>Previous</Button>
                <span className="text-muted-foreground">
                  {currentCardIndex + 1} of {course.flashcards.length}
                </span>
                <Button variant="outline" onClick={handleNextCard}>Next</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qa" className="space-y-8">
            {course.questions.map((item, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-medium">{item.question}</h3>
                <p className="text-foreground/80 bg-muted/30 p-4 rounded-md border">{item.answer}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="quiz">
            <div className="space-y-8 max-w-3xl">
              {course.mcqs.map((mcq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{`${index + 1}. ${mcq.question}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mcq.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`flex items-center space-x-2 p-3 rounded-md transition-colors cursor-pointer ${
                          selectedAnswers[index] === option
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-muted"
                        } ${
                          showResults
                            ? option === mcq.correctAnswer
                              ? "bg-green-500/10 border-green-500/30"
                              : selectedAnswers[index] === option && option !== mcq.correctAnswer
                              ? "bg-red-500/10 border-red-500/30"
                              : ""
                            : ""
                        }`}
                        onClick={() => {
                          if (!showResults) handleSelectAnswer(index, option);
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border ${
                            selectedAnswers[index] === option
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          } flex items-center justify-center`}
                        >
                          {selectedAnswers[index] === option && (
                            <div className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span>{option}</span>
                        {showResults && option === mcq.correctAnswer && (
                          <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {!showResults ? (
                <Button 
                  onClick={handleSubmitQuiz} 
                  disabled={Object.keys(selectedAnswers).length !== course.mcqs.length}
                >
                  Submit Answers
                </Button>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Results</CardTitle>
                    <CardDescription>
                      You scored {getScorePercentage()}% on this quiz
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={getScorePercentage()} className="h-3" />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
};

export default CourseDetail;
