
# StudyMate AI Learning Platform

## Environment Setup

This application requires the following environment variables to be set in a `.env` file in the root directory:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the API key and paste it into your `.env` file as `VITE_GEMINI_API_KEY`

## Running the Application

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory and add the environment variables as described above
4. Start the application: `npm run dev`

## Features

- AI-powered course generation using Google's Gemini API
- Interactive flashcards
- Quiz system with multiple-choice questions
- Mock interview preparation with AI feedback
- Real-time progress tracking

## How It Works

### Course Generation

1. Enter a topic, purpose, and difficulty level
2. The application calls the Gemini API directly to generate comprehensive course content
3. Content is structured with chapters, flashcards, quizzes, and Q&A sections
4. Progress is tracked in real-time with a loading indicator

### Mock Interviews

1. Enter job role, tech stack, and experience level
2. AI generates relevant interview questions
3. Practice answering questions in a simulated interview environment
4. Receive AI feedback on your responses

## Troubleshooting

### API Authentication Issues

If you see a 403 error related to the Gemini API:
1. Check that your `VITE_GEMINI_API_KEY` is correctly set in the `.env` file
2. Make sure your API key is valid and has not expired
3. Verify that you have enabled the Generative Language API in your Google Cloud Console

### Course Generation Failures

If course generation fails:
1. Check the console for specific error messages
2. Verify your internet connection
3. Try with a simpler topic or lower difficulty level
4. The system will automatically retry up to 3 times and has a fallback mechanism
