
# StudyMate - AI Learning and Interview Practice Platform

StudyMate is an AI-powered platform for personalized learning and interview practice. Generate custom study materials and practice job interviews with AI feedback.

## Technologies Used

This project is built with:

- **Frontend**:
  - Vite - Fast build tool and development server
  - React - UI library
  - TypeScript - For type safety
  - Tailwind CSS - Utility-first CSS framework
  - shadcn/ui - High-quality UI components
  - React Router - For navigation
  - Tanstack React Query - For data fetching and state management

- **Backend**:
  - Supabase - Backend as a service for:
    - PostgreSQL Database - Storing user data, courses, and interview records
    - Authentication - User management
    - Edge Functions - For AI integrations with Google's Gemini API

## Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) (included with Node.js)

## Installation and Setup

1. **Clone the repository**
   ```sh
   git clone <your-repository-url>
   cd studymate
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up Supabase**
   
   This project uses Supabase for backend services. You'll need to:
   
   1. Create a Supabase account and project at [supabase.com](https://supabase.com)
   2. Get your Supabase URL and anon key from your project dashboard
   3. Set up the same database schema as used in this project (tables for users, courses, chapters, mock interviews, etc.)
   4. (Optional) Set up OAuth providers if you want social login

4. **Set up Gemini API**
   
   For AI features, you need a Google Gemini API key:
   
   1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Add your Gemini API key to Supabase edge function secrets

## Running the Application

1. **Start the development server**
   ```sh
   npm run dev
   ```

2. **Access the application**
   
   Open your browser and navigate to `http://localhost:8080`

## Deployment

The application is configured for easy deployment to various platforms:

- **Vercel/Netlify**: Connect your repository and they will automatically build and deploy your application
- **Self-hosted**: Build the application with `npm run build` and serve the `dist` directory with a web server

## Project Structure

- `/src` - Source code
  - `/components` - React components
  - `/context` - Context providers
  - `/hooks` - Custom React hooks
  - `/integrations` - Integration with external services (Supabase)
  - `/lib` - Utility functions
  - `/pages` - Page components
  - `/services` - API service functions
  - `/types` - TypeScript type definitions

## Key Features

- **Course Generation**: AI-powered course creation based on your learning goals
- **Mock Interviews**: Practice interviews with AI feedback
- **Personalized Dashboard**: Track your learning progress
- **Interactive Learning**: Multi-format learning materials

## Supabase Configuration

This project uses the following Supabase features:

1. **Authentication**: Email/password authentication
2. **Database**: Storing user profiles, courses, and interview data
3. **Edge Functions**: For AI integrations (Gemini API)

### Required Database Tables:

- `users` - Storing user profiles
- `courses` - For storing course information
- `chapters` - For storing course chapters
- `flashcards` - For storing learning flashcards
- `mcqs` - For storing multiple choice questions
- `qna` - For storing Q&A pairs
- `mock_interviews` - For storing interview sessions
- `interview_questions` - For storing interview questions
- `interview_analysis` - For storing interview feedback

### Edge Functions:

- `gemini-api` - Handle interactions with Google's Gemini API for course generation and interview analysis

## Environment Variables

The project uses Supabase environment variables that are configured in the Supabase dashboard:

- `GEMINI_API_KEY` - Your Google Gemini API key (set in Supabase Edge Function secrets)

## Troubleshooting

- **API Key Issues**: Ensure your Gemini API key is correctly set in Supabase Edge Function secrets
- **Database Errors**: Check that your Supabase database schema matches the required structure
- **Authentication Problems**: Verify your Supabase authentication settings

## License

[MIT License](LICENSE)
