
# StudyMate AI Learning Platform

## Overview

StudyMate is an AI-powered learning platform that helps users generate interactive courses and practice for interviews. The platform includes:

- Course generation on various topics
- Interactive flashcards for effective learning
- Quiz system with multiple-choice questions
- Mock interview preparation with simulated questions
- Real-time progress tracking

## Environment Setup

This application currently uses static data by default for course generation and mock interviews, but you can configure it to use the Gemini API for dynamic content generation.

### Setting Up the Environment

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory (optional for API integration)
4. Start the application: `npm run dev`

### Using the Gemini API (Optional)

If you want to use dynamic content generation with Google's Gemini API:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add the key to your `.env` file:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
4. Open `src/configs/environment.ts` and set `USE_STATIC_DATA = false`

## Features

### Course Generation

1. Enter a topic, purpose, and difficulty level
2. The application generates comprehensive course content with:
   - Structured chapters with detailed explanations
   - Flashcards for key concepts
   - Multiple-choice questions to test understanding
   - Q&A pairs for deeper learning

### Mock Interviews

1. Enter job role, tech stack, and experience level
2. Practice with role-specific interview questions
3. Record your answers with video for self-assessment
4. Receive feedback on your performance

## How It Works

The application now uses pre-defined static data for immediate functionality without requiring API keys. When you create a course or mock interview, it will use relevant templates based on the topics you select.

If you configure the Gemini API key and disable static data mode, the application will generate custom content tailored to your specific requests.

## Troubleshooting

### No Content Generated

If you're not seeing content generated:
- Make sure you are using the latest version of the application
- Check that `USE_STATIC_DATA` is set to `true` in `src/configs/environment.ts`
- If using API mode, verify your API key is correctly set in the `.env` file

### Using Your Own Backend

If you want to use your own backend service instead:
1. Create a Flask API following the structure in `api/flask_api.py`
2. Set `VITE_FLASK_API_URL` in your `.env` file to point to your backend
3. Update the relevant API service calls in the codebase
