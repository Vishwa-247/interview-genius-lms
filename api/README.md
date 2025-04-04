
# Flask API for AI-Powered Course Generation

This Flask API provides endpoints for AI-powered content generation using Google's Gemini models.

## Setup Instructions

1. **Install dependencies**:
   ```bash
   pip install flask flask-cors google-generativeai
   ```

2. **Set environment variables**:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   export FLASK_DEBUG="true"  # Set to "false" in production
   export PORT=5000  # Optional, default is 5000
   ```

3. **Run the server**:
   ```bash
   python flask_api.py
   ```

## API Endpoints

### POST /generate
Generates content based on the specified action.

**Request Body**:
```json
{
  "action": "one of: generate_course, generate_interview_questions, summarize_text, explain_code, custom_content",
  "topic": "Course topic (for generate_course)",
  "purpose": "Course purpose (for generate_course)",
  "difficulty": "Difficulty level (for generate_course)",
  "jobRole": "Job role (for generate_interview_questions)",
  "techStack": "Technology stack (for generate_interview_questions)",
  "experience": "Years of experience (for generate_interview_questions)",
  "questionCount": "Number of questions (optional, for generate_interview_questions)",
  "text": "Text to summarize (for summarize_text)",
  "code": "Code to explain (for explain_code)",
  "prompt": "Custom prompt (for custom_content)"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    // AI-generated content
  }
}
```

## Notes

- The API requires CORS to be enabled to work with web clients.
- In production, always secure your API with proper authentication.
- The Gemini API has rate limits and token usage limits.
