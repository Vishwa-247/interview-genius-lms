
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
- A Supabase account for backend services
- A Google Gemini API key for AI features

## Installation and Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/studymate.git
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
   3. Create the following tables in your Supabase database:
      - `courses` - For storing course information
      - `mock_interviews` - For storing interview sessions
      - `interview_questions` - For storing interview questions
      - `interview_analysis` - For storing interview feedback
      - `study_material` - For storing additional study content
      - `users` - For storing extended user profile data

4. **Configure environment variables**
   
   Create a file named `.env.local` in the root directory and add the following:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Deploy Supabase Edge Functions**

   The project uses Supabase Edge Functions to communicate with Google's Gemini API. You'll need to:
   
   1. Install the Supabase CLI: `npm install -g supabase`
   2. Login to Supabase CLI: `supabase login`
   3. Link your project: `supabase link --project-ref your-project-ref`
   4. Deploy the edge functions: `supabase functions deploy gemini-api`
   5. Add your Gemini API key as a secret to the edge function:
      ```
      supabase secrets set GEMINI_API_KEY=your_gemini_api_key
      ```

## Running the Application

1. **Start the development server**
   ```sh
   npm run dev
   ```

2. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

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
- `/supabase` - Supabase configuration and edge functions
  - `/functions` - Edge function implementations

## Key Features

- **Course Generation**: AI-powered course creation based on your learning goals
- **Mock Interviews**: Practice interviews with AI feedback
- **Personalized Dashboard**: Track your learning progress
- **Interactive Learning**: Multi-format learning materials

## Supabase Configuration

Make sure your Supabase database has the following tables correctly set up:

1. **courses**: Store course information
   - `id` (UUID, primary key)
   - `user_id` (UUID)
   - `title` (text)
   - `purpose` (text)
   - `difficulty` (text)
   - `summary` (text)
   - `content` (JSON)
   - `created_at` (timestamp)

2. **mock_interviews**: Store interview sessions
   - `id` (UUID, primary key)
   - `user_id` (UUID)
   - `job_role` (text)
   - `tech_stack` (text)
   - `experience` (text)
   - `completed` (boolean)
   - `created_at` (timestamp)

3. **interview_questions**: Store interview questions
   - `id` (UUID, primary key)
   - `interview_id` (UUID, foreign key to mock_interviews.id)
   - `question` (text)
   - `user_answer` (text, nullable)
   - `order_number` (integer)
   - `created_at` (timestamp)

4. **interview_analysis**: Store interview feedback
   - `id` (UUID, primary key)
   - `interview_id` (UUID, foreign key to mock_interviews.id)
   - `facial_data` (JSON, nullable)
   - `pronunciation_feedback` (text, nullable)
   - `technical_feedback` (text, nullable)
   - `language_feedback` (text, nullable)
   - `recommendations` (JSON, nullable)
   - `created_at` (timestamp)

## Gemini API Configuration

This project uses Google's Gemini API for AI features. You'll need to:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add your Gemini API key to Supabase edge function secrets as described in the setup instructions

## Troubleshooting

- **API Key Issues**: Ensure your Gemini API key is correctly set in Supabase Edge Function secrets
- **Database Errors**: Check that your Supabase database schema matches the required structure
- **Authentication Problems**: Verify your Supabase authentication settings are properly configured
- **Course Generation Errors**: If courses aren't generating, check the Edge Function logs in your Supabase dashboard

## License

[MIT License](LICENSE)
