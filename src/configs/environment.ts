
// Environment variables
export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Log if Gemini API key is missing (for debugging)
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not set in environment variables. Using static mock data instead.");
}

// Flag to use static data instead of API calls
export const USE_STATIC_DATA = true;

// Course generation prompt template
export const COURSE_PROMPT_TEMPLATE = `Create a complete course on {topic} for {purpose} at {difficulty} level.

Follow this exact structure:

# SUMMARY
Provide a concise overview of what the course covers and its objectives.

# CHAPTERS
Create 5-8 logically structured chapters. For each chapter:
## [Chapter Title]
[Chapter Content with detailed and comprehensive content including examples, explanations, and relevant concepts]

# FLASHCARDS
Create at least 15 flashcards in this format:
- Question: [question text]
- Answer: [answer text]

# MCQs (Multiple Choice Questions)
Create at least 10 multiple choice questions in this format:
- Question: [question text]
- Options: 
a) [option text] 
b) [option text] 
c) [option text] 
d) [option text]
- Correct Answer: [correct letter]

# Q&A PAIRS
Create at least 10 question and answer pairs for deeper understanding:
- Question: [detailed question]
- Answer: [comprehensive answer]

Ensure the course is educational, accurate, and tailored to the specified purpose and difficulty level.`;

// Interview questions prompt template
export const INTERVIEW_QUESTIONS_PROMPT_TEMPLATE = `Generate {questionCount} interview questions for a {experience} years experienced {jobRole} with expertise in {techStack}.

The questions should be challenging and relevant to the role, focusing on:
1. Technical knowledge and practical application
2. Problem-solving abilities
3. Scenario-based questions
4. Teamwork and collaboration skills

Format as a numbered list of questions.`;

// Sample static interview questions for different tech stacks
export const STATIC_INTERVIEW_QUESTIONS = {
  "React": [
    "Explain the concept of state management in React and compare different approaches.",
    "How would you optimize the performance of a React application?",
    "Can you explain the difference between controlled and uncontrolled components?",
    "What are React hooks and how do they work?",
    "How would you handle authentication in a React application?"
  ],
  "JavaScript": [
    "Explain closures in JavaScript with examples.",
    "What is the event loop in JavaScript and how does it work?",
    "Describe the difference between var, let, and const.",
    "How would you handle asynchronous operations in JavaScript?",
    "Explain prototypal inheritance in JavaScript."
  ],
  "Python": [
    "What are Python generators and how would you use them?",
    "Explain the difference between lists and tuples in Python.",
    "How would you handle errors and exceptions in Python?",
    "What are decorators in Python and how do they work?",
    "Explain multithreading vs multiprocessing in Python."
  ],
  "Data Science": [
    "Explain the difference between supervised and unsupervised learning.",
    "How would you handle missing data in a dataset?",
    "Describe the process of feature selection and its importance.",
    "What techniques would you use to prevent overfitting?",
    "Explain the bias-variance tradeoff in machine learning."
  ],
  "DevOps": [
    "Explain the concept of Infrastructure as Code.",
    "How would you set up CI/CD pipelines for a microservices architecture?",
    "What strategies would you use for container orchestration?",
    "Describe your approach to monitoring and alerting in a production environment.",
    "How would you manage secrets in a Kubernetes environment?"
  ]
};

// Sample static course templates for different topics
export const STATIC_COURSE_TEMPLATES = {
  "React": {
    title: "React.js Mastery",
    summary: "This comprehensive course covers React.js fundamentals, advanced patterns, and best practices for building modern web applications. You'll learn component structure, state management, hooks, and performance optimization techniques.",
    chapters: [
      {
        title: "React Fundamentals",
        content: "## React Fundamentals\n\nReact is a JavaScript library for building user interfaces. This chapter covers the core concepts of React including components, JSX, and the virtual DOM.\n\n### Components\nComponents are the building blocks of React applications. They are reusable pieces of code that return React elements describing what should appear on the screen.\n\n### JSX\nJSX is a syntax extension for JavaScript that looks similar to HTML. It makes the React code more readable and expressive."
      },
      {
        title: "State and Props",
        content: "## State and Props\n\nState and props are core concepts in React that govern how data flows through your application.\n\n### Props\nProps (short for properties) are a way of passing data from parent to child components. They are immutable and should not be modified by the component receiving them.\n\n### State\nState represents data that changes over time. When state changes, the component re-renders."
      },
      {
        title: "React Hooks",
        content: "## React Hooks\n\nHooks are functions that let you use state and other React features without writing a class. They were introduced in React 16.8.\n\n### useState\nThe useState hook allows functional components to manage state.\n\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n### useEffect\nThe useEffect hook performs side effects in functional components.\n\n```jsx\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);\n```"
      }
    ],
    flashcards: [
      { question: "What is JSX?", answer: "JSX is a syntax extension for JavaScript that looks similar to HTML and makes React code more readable." },
      { question: "What are React hooks?", answer: "Hooks are functions that allow functional components to use React features like state and lifecycle methods." },
      { question: "What is the virtual DOM?", answer: "The virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering performance." }
    ],
    mcqs: [
      {
        question: "What function is used to update state in a functional component?",
        options: ["updateState()", "setState()", "The setter function returned by useState()", "modifyState()"],
        correctAnswer: "The setter function returned by useState()"
      },
      {
        question: "Which hook is used for side effects in React?",
        options: ["useContext", "useEffect", "useReducer", "useMemo"],
        correctAnswer: "useEffect"
      }
    ],
    qnas: [
      {
        question: "How does React's diffing algorithm work?",
        answer: "React's diffing algorithm (reconciliation) compares the current virtual DOM with the previous one, identifies what has changed, and updates only those parts in the actual DOM, minimizing expensive DOM operations."
      },
      {
        question: "What are controlled components in React?",
        answer: "Controlled components are form elements whose values are controlled by React state. The component maintains the state, and updates happen through event handlers."
      }
    ]
  },
  "Python": {
    title: "Python Programming Fundamentals",
    summary: "This course provides a comprehensive introduction to Python programming, covering syntax, data structures, functions, and object-oriented programming concepts.",
    chapters: [
      {
        title: "Getting Started with Python",
        content: "## Getting Started with Python\n\nPython is a high-level, interpreted programming language known for its readability and simplicity. This chapter introduces you to Python basics.\n\n### Installing Python\nTo start programming in Python, you need to install it on your computer. Visit python.org to download the latest version.\n\n### Your First Python Program\n```python\nprint('Hello, World!')\n```"
      }
    ],
    flashcards: [
      { question: "What is a Python list?", answer: "A list is a collection of ordered, mutable items that can be of different types." },
      { question: "What is a dictionary in Python?", answer: "A dictionary is a collection of key-value pairs that is unordered and mutable." }
    ],
    mcqs: [
      {
        question: "Which of the following is not a Python data type?",
        options: ["List", "Dictionary", "Array", "Tuple"],
        correctAnswer: "Array"
      }
    ],
    qnas: [
      {
        question: "What are Python generators and when would you use them?",
        answer: "Generators are functions that return an iterator that yields items one at a time, generating them only when needed. They are memory efficient for working with large datasets or infinite sequences."
      }
    ]
  },
  "Data Science": {
    title: "Introduction to Data Science",
    summary: "This course introduces the fundamentals of data science, covering data manipulation, visualization, statistical analysis, and machine learning techniques.",
    chapters: [
      {
        title: "Introduction to Data Science",
        content: "## Introduction to Data Science\n\nData Science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data.\n\n### What is Data Science?\nData Science combines statistics, data analysis, and machine learning to understand and analyze actual phenomena with data."
      }
    ],
    flashcards: [
      { question: "What is feature engineering?", answer: "Feature engineering is the process of using domain knowledge to extract features from raw data that make machine learning algorithms work better." },
      { question: "What is overfitting?", answer: "Overfitting occurs when a model learns the training data too well, including its noise and outliers, resulting in poor performance on new, unseen data." }
    ],
    mcqs: [
      {
        question: "Which of the following is not a common step in the data science process?",
        options: ["Data collection", "Data cleaning", "Data encryption", "Feature engineering"],
        correctAnswer: "Data encryption"
      }
    ],
    qnas: [
      {
        question: "How would you handle imbalanced datasets in classification problems?",
        answer: "Techniques include undersampling the majority class, oversampling the minority class (e.g., SMOTE), using different evaluation metrics like F1-score or AUC-ROC, applying class weights, or ensemble methods like adaptive boosting."
      }
    ]
  }
};
