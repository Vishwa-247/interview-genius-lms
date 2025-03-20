
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

const CourseDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [course, setCourse] = useState<CourseType | null>(null);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [mcqs, setMcqs] = useState<McqType[]>([]);
  const [qnas, setQnas] = useState<QnaType[]>([]);
  const [activeTab, setActiveTab] = useState("chapters");
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Sample data for course details (would normally be fetched from Supabase)
  const sampleCourse: CourseType = {
    id: id || "1",
    user_id: "user123",
    title: "Advanced React Patterns and Performance Optimization",
    purpose: "job_interview",
    difficulty: "advanced",
    summary: "This comprehensive course delves into advanced React patterns, architecture, and optimization techniques. You'll learn how to structure large-scale applications, implement complex state management strategies, and optimize performance for production environments. Ideal for developers preparing for senior frontend role interviews.",
    created_at: new Date().toISOString(),
  };

  const sampleChapters: ChapterType[] = [
    {
      id: "ch1",
      course_id: id || "1",
      title: "React Component Patterns",
      content: `
# React Component Patterns

React offers various component patterns that help in creating reusable, maintainable, and optimized code. Here are the main patterns you should know:

## 1. Compound Components

Compound components are a pattern where components are composed together to share an implicit state while giving the user complete control over the rendering and composition of the components.

\`\`\`jsx
// Usage example
<Menu>
  <MenuButton>Options</MenuButton>
  <MenuList>
    <MenuItem>Download</MenuItem>
    <MenuItem>Create a Copy</MenuItem>
    <MenuItem>Delete</MenuItem>
  </MenuList>
</Menu>
\`\`\`

## 2. Render Props

Render Props is a technique for sharing code between components using a prop whose value is a function.

\`\`\`jsx
// Example
<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)}/>
\`\`\`

## 3. Higher-Order Components (HOCs)

HOCs are functions that take a component and return a new component with additional props or behavior.

\`\`\`jsx
// Example
const EnhancedComponent = withExtraProps(BaseComponent);
\`\`\`

## 4. Custom Hooks

Custom Hooks allow you to extract component logic into reusable functions.

\`\`\`jsx
// Example
function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  function handleChange(e) {
    setValue(e.target.value);
  }
  
  return {
    value,
    onChange: handleChange
  };
}
\`\`\`

## 5. Control Props

Control Props give the parent component control over the internal state of a child component.

\`\`\`jsx
// Example
<Dropdown
  isOpen={isOpen}
  onToggle={setIsOpen}
  items={items}
/>
\`\`\`

Each pattern has its own use cases and trade-offs. Understanding when to use each pattern will help you design more flexible and maintainable React applications.
      `,
      order_number: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "ch2",
      course_id: id || "1",
      title: "Advanced State Management",
      content: `
# Advanced State Management in React

State management is one of the most critical aspects of building complex React applications. This chapter covers advanced state management techniques beyond simple useState.

## 1. Context API for Global State

React's Context API provides a way to share values like themes or user data without having to explicitly pass props through every level of the component tree.

\`\`\`jsx
// Creating a context
const ThemeContext = React.createContext('light');

// Provider component
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ThemedButton />
    </ThemeContext.Provider>
  );
}

// Consumer component
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <Button theme={theme} />;
}
\`\`\`

## 2. Redux and Redux Toolkit

Redux provides a predictable state container for JavaScript applications. Redux Toolkit is the official, opinionated toolset for efficient Redux development.

\`\`\`jsx
// Redux slice with Redux Toolkit
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    incremented: state => {
      state.value += 1;
    },
    decremented: state => {
      state.value -= 1;
    }
  }
});
\`\`\`

## 3. Zustand

Zustand is a small, fast, and scalable state-management solution using simplified flux principles.

\`\`\`jsx
// Creating a store
const useStore = create(set => ({
  bears: 0,
  increasePopulation: () => set(state => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 })
}));
\`\`\`

## 4. React Query for Server State

React Query is a library for fetching, caching, and updating asynchronous data in React.

\`\`\`jsx
// Example usage
const { data, isLoading, error } = useQuery('todos', fetchTodos);
\`\`\`

## 5. Recoil

Recoil is an experimental state management library for React apps developed by Facebook.

\`\`\`jsx
// Defining an atom
const counterState = atom({
  key: 'counterState',
  default: 0,
});

// Using the atom
function Counter() {
  const [count, setCount] = useRecoilState(counterState);
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </>
  );
}
\`\`\`

Understanding these state management techniques will help you choose the right solution for your specific use case, from simple component state to complex global state management.
      `,
      order_number: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "ch3",
      course_id: id || "1",
      title: "Performance Optimization Techniques",
      content: `
# Performance Optimization Techniques in React

Optimizing React applications is crucial for providing a smooth user experience. This chapter covers various techniques to improve the performance of your React applications.

## 1. Memoization with React.memo, useMemo, and useCallback

These React features help prevent unnecessary re-renders and recalculations.

\`\`\`jsx
// React.memo example
const MemoizedComponent = React.memo(function MyComponent(props) {
  // Only re-renders if props change
  return <div>{props.name}</div>;
});

// useMemo example
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// useCallback example
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
\`\`\`

## 2. Code Splitting with React.lazy and Suspense

Code splitting allows you to split your code into small chunks that can be loaded on demand.

\`\`\`jsx
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </React.Suspense>
  );
}
\`\`\`

## 3. Virtualization for Long Lists

Virtualization renders only the visible items in a long list, significantly improving performance.

\`\`\`jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  );

  return (
    <FixedSizeList
      height={500}
      width={300}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

## 4. Web Workers for CPU-Intensive Tasks

Web Workers allow you to run JavaScript in background threads, keeping the UI responsive.

\`\`\`jsx
// Creating a worker
const worker = new Worker('./worker.js');

// Sending message to worker
worker.postMessage({ data: complexData });

// Receiving results from worker
worker.onmessage = function(e) {
  const result = e.data;
  setProcessedData(result);
};
\`\`\`

## 5. Bundle Size Optimization

Reducing bundle size improves loading times and overall performance.

- Use lightweight alternatives (e.g., Preact instead of React for simple apps)
- Tree shaking to eliminate dead code
- Dynamic imports for less frequently used features
- Analyze bundle with tools like Webpack Bundle Analyzer

\`\`\`jsx
// Dynamic import example
const loadAnalytics = () => import('./analytics');

button.addEventListener('click', async () => {
  const analytics = await loadAnalytics();
  analytics.trackClick();
});
\`\`\`

Implementing these optimization techniques will help you build React applications that are fast, responsive, and provide a great user experience even as the application grows in complexity.
      `,
      order_number: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const sampleFlashcards: FlashcardType[] = [
    {
      id: "f1",
      course_id: id || "1",
      question: "What is a Higher-Order Component (HOC) in React?",
      answer: "A Higher-Order Component is a function that takes a component and returns a new enhanced component with additional props or behavior. HOCs are a pattern derived from React's compositional nature and are used for cross-cutting concerns like state abstraction, code reuse, and props manipulation.",
      created_at: new Date().toISOString(),
    },
    {
      id: "f2",
      course_id: id || "1",
      question: "What is the purpose of React.memo?",
      answer: "React.memo is a higher-order component that memoizes the rendered output of a component, preventing unnecessary re-renders when the component's props haven't changed. It performs a shallow comparison of props by default but can be customized with a comparison function.",
      created_at: new Date().toISOString(),
    },
    {
      id: "f3",
      course_id: id || "1",
      question: "Explain the difference between useMemo and useCallback.",
      answer: "Both hooks are used for memoization, but useMemo caches the return value of a function, while useCallback caches the function instance itself. useMemo is used to avoid expensive calculations on every render, while useCallback is used to maintain referential equality of functions, which is important when passing callbacks to optimized child components.",
      created_at: new Date().toISOString(),
    },
    {
      id: "f4",
      course_id: id || "1",
      question: "What is the key difference between state and props in React?",
      answer: "Props are passed down from parent components and are read-only within the receiving component. State is managed within the component itself and can be updated using setState (class components) or state updater functions (hooks). Props represent external configuration, while state represents internal component state.",
      created_at: new Date().toISOString(),
    },
    {
      id: "f5",
      course_id: id || "1",
      question: "What is the React Context API used for?",
      answer: "The Context API provides a way to share values like themes, user data, or language preferences between components without explicitly passing props through every level of the component tree. It helps avoid 'prop drilling' in complex component hierarchies and is ideal for global state that many components need to access.",
      created_at: new Date().toISOString(),
    },
  ];

  const sampleMcqs: McqType[] = [
    {
      id: "m1",
      course_id: id || "1",
      question: "Which hook would you use to perform side effects in a function component?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correct_answer: "useEffect",
      created_at: new Date().toISOString(),
    },
    {
      id: "m2",
      course_id: id || "1",
      question: "What is the correct way to update an object state in React using hooks?",
      options: [
        "setState(prevState.property = newValue)",
        "setState(prevState.property: newValue)",
        "setState({ ...prevState, property: newValue })",
        "setState(Object.assign(prevState, { property: newValue }))"
      ],
      correct_answer: "setState({ ...prevState, property: newValue })",
      created_at: new Date().toISOString(),
    },
    {
      id: "m3",
      course_id: id || "1",
      question: "In React, what happens when you call setState?",
      options: [
        "The component re-renders immediately",
        "The state object is changed immediately then the component re-renders",
        "The state update is queued, and React decides when to re-render for performance",
        "Nothing happens until you call forceUpdate()"
      ],
      correct_answer: "The state update is queued, and React decides when to re-render for performance",
      created_at: new Date().toISOString(),
    },
    {
      id: "m4",
      course_id: id || "1",
      question: "Which of the following is NOT a React hook?",
      options: ["useEffect", "useState", "useHistory", "useComponent"],
      correct_answer: "useComponent",
      created_at: new Date().toISOString(),
    },
    {
      id: "m5",
      course_id: id || "1",
      question: "What technique would you use to prevent a component from re-rendering when its parent re-renders but its props haven't changed?",
      options: [
        "shouldComponentUpdate lifecycle method",
        "React.memo higher-order component",
        "Pure components",
        "All of the above"
      ],
      correct_answer: "All of the above",
      created_at: new Date().toISOString(),
    },
  ];

  const sampleQnas: QnaType[] = [
    {
      id: "q1",
      course_id: id || "1",
      question: "What are some common performance issues in React applications and how would you diagnose them?",
      answer: "Common performance issues in React applications include:\n\n1. **Unnecessary re-renders**: Components re-rendering when they don't need to.\n2. **Large bundle sizes**: Initial load time is slow due to large JavaScript bundles.\n3. **Memory leaks**: Components or event listeners not being properly cleaned up.\n4. **Expensive calculations**: Performing heavy computations in render methods or during frequent state updates.\n5. **Network waterfalls**: Making sequential API calls instead of parallel ones.\n\nTo diagnose these issues:\n\n- Use React Developer Tools's Profiler to identify components that re-render too often or take too long to render.\n- Use the Performance tab in Chrome DevTools to analyze load time, JavaScript execution, and layout shifts.\n- Use Lighthouse for overall performance audits.\n- Use tools like Webpack Bundle Analyzer to identify large dependencies.\n- Use the Memory tab in Chrome DevTools to detect memory leaks.\n\nOnce issues are identified, solutions might include code splitting, memoization, virtualization for long lists, optimizing API calls, or refactoring component architecture.",
      created_at: new Date().toISOString(),
    },
    {
      id: "q2",
      course_id: id || "1",
      question: "Explain how you would architect a large-scale React application for maintainability and scalability.",
      answer: "Architecting a large-scale React application requires a thoughtful approach to code organization, state management, and team collaboration. Here's a comprehensive strategy:\n\n1. **Project Structure**:\n   - Feature-based or domain-driven folder structure instead of type-based\n   - Consistent naming conventions\n   - Clear separation between UI components, containers, hooks, and utilities\n   - Shared component library for design system implementation\n\n2. **State Management**:\n   - Use context + hooks for simpler global state\n   - Consider Redux (with Redux Toolkit) or MobX for complex state requirements\n   - Use React Query or SWR for server state\n   - Clear boundaries between local and global state\n\n3. **Code Splitting and Lazy Loading**:\n   - Route-based code splitting\n   - Component-based code splitting for large features\n   - Prioritize critical rendering path\n\n4. **Testing Strategy**:\n   - Unit tests for logic and utilities\n   - Component tests for UI behavior\n   - Integration tests for feature flows\n   - E2E tests for critical user journeys\n   - Clear testing patterns and utilities\n\n5. **Performance Optimization**:\n   - Memoization strategies (React.memo, useMemo, useCallback)\n   - Virtualization for long lists\n   - Image and asset optimization\n   - Strategic re-render prevention\n\n6. **Developer Experience**:\n   - Strong typing with TypeScript\n   - Comprehensive documentation\n   - Linting and formatting automation\n   - CI/CD pipeline for quality checks\n\n7. **Scalable Routing**:\n   - Nested routes for complex features\n   - Route-based code splitting\n   - Route guards for authentication/authorization\n\n8. **API Layer**:\n   - Centralized API client\n   - Response caching and request deduplication\n   - Error handling patterns\n   - Mock service workers for development\n\nThis architecture allows teams to work in parallel, keeps the codebase maintainable as it grows, and ensures good performance even as features are added.",
      created_at: new Date().toISOString(),
    },
    {
      id: "q3",
      course_id: id || "1",
      question: "What strategies would you use to optimize the performance of a React application that renders large datasets?",
      answer: "When dealing with large datasets in React, several optimization strategies can be employed:\n\n1. **Virtualization (Windowing)**:\n   - Use libraries like `react-window` or `react-virtualized` to render only the visible items\n   - Prevents rendering thousands of DOM nodes simultaneously\n   - Essential for lists with more than a few hundred items\n\n2. **Data Pagination and Infinite Scrolling**:\n   - Fetch and display data in chunks rather than all at once\n   - Implement infinite scrolling to load more data as the user scrolls\n   - Use cursor-based pagination for consistent performance\n\n3. **Memoization**:\n   - Use `React.memo` for pure components that render list items\n   - Apply `useMemo` for expensive derived calculations from data\n   - Implement `useCallback` for event handlers to maintain reference stability\n\n4. **State Management Optimization**:\n   - Consider normalized state shape to avoid duplication\n   - Use immutable data patterns for efficient change detection\n   - For Redux, implement selectors with Reselect for efficient derived data\n\n5. **Web Workers**:\n   - Offload heavy data processing to background threads\n   - Keep UI thread responsive while processing large datasets\n   - Libraries like `comlink` make working with Web Workers easier\n\n6. **Incremental Rendering**:\n   - Break rendering work into smaller chunks with time slicing\n   - Consider React 18's concurrent features and useTransition hook\n   - Prioritize critical updates over less important ones\n\n7. **Optimized Rendering Logic**:\n   - Avoid creating new objects/arrays in render\n   - Use stable keys for list items (not array index for dynamic lists)\n   - Prevent layout thrashing by batching DOM measurements and updates\n\n8. **Data Structure Selection**:\n   - Choose appropriate data structures for frequent operations (Maps for lookups, etc.)\n   - Pre-process and transform data outside of the render cycle when possible\n\n9. **Database Query Optimization**:\n   - Fetch only necessary fields (GraphQL can help here)\n   - Use server-side filtering, sorting, and aggregation\n   - Implement efficient backend pagination\n\nBy combining these strategies appropriately based on your specific use case, you can achieve smooth performance even with very large datasets.",
      created_at: new Date().toISOString(),
    },
  ];
  
  useEffect(() => {
    // In a real application, we would fetch data from the database
    // For this example, we're using the sample data
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      setCourse(sampleCourse);
      setChapters(sampleChapters);
      setFlashcards(sampleFlashcards);
      setMcqs(sampleMcqs);
      setQnas(sampleQnas);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id]);

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
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="mb-8 text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
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
                      __html: chapter.content
                        .replace(/^#\s(.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
                        .replace(/^##\s(.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>')
                        .replace(/^###\s(.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
                        .replace(/^(.+)$/gm, '<p class="my-3">$1</p>')
                        .replace(/\`\`\`(.+?)\n([\s\S]*?)\`\`\`/g, '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code>$2</code></pre>')
                        .replace(/\`([^\`]+)\`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
                     }} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="flashcards" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="mcq" className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="qna" className="space-y-6">
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
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default CourseDetail;
