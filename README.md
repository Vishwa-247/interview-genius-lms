

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
  - Flask API - Python backend for Gemini AI integration
  - Supabase - Backend as a service for:
    - PostgreSQL Database - Storing user data, courses, and interview records
    - Authentication - User management

## Prerequisites

Before you start, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) (included with Node.js)
- [Python](https://www.python.org/) (v3.8 or newer)
- [pip](https://pip.pypa.io/en/stable/installation/) (for Python packages)
- A Supabase account for backend services
- A Google Gemini API key for AI features

## Installation and Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/yourusername/studymate.git
   cd studymate
   ```

2. **Install frontend dependencies**
   ```sh
   npm install
   ```

3. **Install Python dependencies for Flask API**
   ```sh
   cd api
   pip install flask flask_cors google-generativeai
   cd ..
   ```

4. **Set up Supabase**
   
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

5. **Configure environment variables**
   
   Create a file named `.env.local` in the root directory and add the following:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FLASK_API_URL=http://localhost:5000
   ```

6. **Set up Google Gemini API**

   1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   2. Create a file named `.env` in the `api` directory with the following:
      ```
      GEMINI_API_KEY=your_gemini_api_key
      FLASK_DEBUG=true
      ```

## Running the Application

1. **Start the Flask API server**
   ```sh
   cd api
   python flask_api.py
   ```

2. **Start the frontend development server in a separate terminal**
   ```sh
   npm run dev
   ```

3. **Access the application**
   
   Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Testing the Gemini API Integration

To verify that the Gemini API integration is working properly:

1. **Test course generation:**
   - Sign in to the application
   - Navigate to the Course Generator page
   - Fill in the form with a course topic, purpose, and difficulty level
   - Click "Generate Course"
   - Check the browser console for API call logs with the Flask API
   - Verify that a progress bar appears showing the generation process
   - You should see a success message when complete

2. **Test the chatbot:**
   - Open the application
   - Find the chatbot interface (typically in the lower right corner)
   - Type a message and send it
   - Check the browser console for API call logs with the Flask API
   - Verify that you receive a response from the AI

3. **Test mock interviews:**
   - Sign in to the application
   - Navigate to the Mock Interview page
   - Set up an interview with a job role, tech stack, and experience level
   - Start the interview
   - Check the browser console for API call logs with the Flask API
   - Verify that interview questions are generated

4. **Debugging Flask API:**
   - If you're experiencing issues with the API, check the terminal running the Flask server for error logs
   - Verify that your Gemini API key is correctly set in the `.env` file in the `api` directory
   - Ensure the Flask server is running on the correct port (default is 5000)
   - Check that `VITE_FLASK_API_URL` in your frontend `.env.local` points to the correct URL

## Project Structure

- `/src` - Frontend source code
  - `/components` - React components
  - `/context` - Context providers
  - `/hooks` - Custom React hooks
  - `/integrations` - Integration with external services (Supabase)
  - `/lib` - Utility functions
  - `/pages` - Page components
  - `/services` - API service functions
  - `/types` - TypeScript type definitions
- `/api` - Flask API for Gemini integration
  - `flask_api.py` - API server implementation

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

## Troubleshooting

- **API Key Issues**: Ensure your Gemini API key is correctly set in the api/.env file
- **Flask API Connection Issues**: Check that the Flask server is running and the VITE_FLASK_API_URL is correct
- **Database Errors**: Check that your Supabase database schema matches the required structure
- **Authentication Problems**: Verify your Supabase authentication settings are properly configured
- **Course Generation Errors**: Check the Flask API console logs for detailed error messages

## License

[MIT License](LICENSE)

