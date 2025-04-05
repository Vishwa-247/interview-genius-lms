
from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure the Gemini API with your API key
# In production, use environment variables for API keys
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "your-api-key-here"))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        action = data.get('action')

        if not action:
            return jsonify({"success": False, "error": "No action specified"}), 400

        request_body = {}

        if action == 'generate_course':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Create a complete course on {data['topic']} for {data['purpose']} at {data['difficulty']} level.\n\n"
                                 f"Follow this exact structure:\n\n"
                                 f"# SUMMARY\nProvide a concise overview of what the course covers and its objectives.\n\n"
                                 f"# CHAPTERS\nCreate 5-8 logically structured chapters. For each chapter:\n"
                                 f"- Title: Clear and descriptive chapter title\n"
                                 f"- Content: Detailed and comprehensive content with examples, explanations, and relevant concepts\n\n"
                                 f"# FLASHCARDS\nCreate at least 15 flashcards in this format:\n"
                                 f"- Question: [question text]\n"
                                 f"- Answer: [answer text]\n\n"
                                 f"# MCQs (Multiple Choice Questions)\nCreate at least 10 multiple choice questions in this format:\n"
                                 f"- Question: [question text]\n"
                                 f"- Options: a) [option text] b) [option text] c) [option text] d) [option text]\n"
                                 f"- Correct Answer: [correct letter]\n\n"
                                 f"# Q&A PAIRS\nCreate at least 10 question and answer pairs for deeper understanding:\n"
                                 f"- Question: [detailed question]\n"
                                 f"- Answer: [comprehensive answer]\n\n"
                                 f"Ensure the course is educational, accurate, and tailored to {data['purpose']} at {data['difficulty']} level."
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 8192,
                }
            }
        
        elif action == 'generate_interview_questions':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Generate {data.get('questionCount', 5)} interview questions for a {data['experience']} years experienced {data['jobRole']} "
                                 f"with expertise in {data['techStack']}. The questions should be challenging and relevant to the role.\n"
                                 f"For each question:\n"
                                 f"1. Focus on technical knowledge and practical application\n"
                                 f"2. Test problem-solving abilities\n"
                                 f"3. Include scenario-based questions\n"
                                 f"4. Assess teamwork and collaboration skills\n"
                                 f"Format as a numbered list."
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                }
            }
        
        elif action == 'analyze_interview':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Analyze this interview response for a {data['jobRole']} position. \n"
                                f"Question: {data['question']}\n"
                                f"Answer: {data['answer']}\n\n"
                                f"Provide detailed analysis in the following format:\n\n"
                                f"Technical Feedback: (Analyze understanding of technical concepts and accuracy)\n"
                                f"Communication Feedback: (Analyze clarity, structure, and language used)\n"
                                f"Strengths: (List 3 specific strengths in the response)\n"
                                f"Areas to Improve: (List 3 specific areas that could be improved)\n"
                                f"Overall Rating: (Give a rating between 0-100)"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048,
                }
            }
        
        elif action == 'generate_flashcards':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Generate 20 detailed flashcards on the topic: {data['topic']} for {data['purpose']} at {data['difficulty']} level.\n"
                                f"Create flashcards in this exact format:\n\n"
                                f"# FLASHCARDS\n"
                                f"- Question: [Specific, clear question text]\n"
                                f"- Answer: [Comprehensive, accurate answer text]\n\n"
                                f"Make sure the flashcards cover key concepts, terms, principles, and applications related to the topic.\n"
                                f"Each answer should be detailed enough to provide complete understanding.\n"
                                f"Ensure varying difficulty levels across the flashcards to test different aspects of knowledge."
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,
                }
            }
        
        elif action == 'summarize_text':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Summarize the following text concisely:\n\n{data['text']}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.5,
                    "maxOutputTokens": 1024,
                }
            }
        
        elif action == 'explain_code':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Explain the following code snippet in detail, including its purpose, logic, and potential improvements:\n\n{data['code']}"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.6,
                    "maxOutputTokens": 2048,
                }
            }
        
        elif action == 'custom_content':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": data['prompt']
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,
                }
            }
        
        else:
            return jsonify({"success": False, "error": f"Unsupported action: {action}"}), 400

        # Add a new route specifically for Gemini API requests
        response = model.generate_content(request_body)
        return jsonify({"success": True, "data": response}), 200
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Add a specific endpoint for Gemini API calls
@app.route('/gemini', methods=['POST'])
def gemini_api():
    try:
        data = request.json
        action = data.get('action')
        request_data = data.get('data', {})
        
        if not action:
            return jsonify({"success": False, "error": "No action specified"}), 400
            
        # Process the request based on the action
        if action == 'generate_course':
            # Same logic as in the generate endpoint for course generation
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Create a complete course on {request_data['topic']} for {request_data['purpose']} at {request_data['difficulty']} level.\n\n"
                                f"Follow this exact structure:\n\n"
                                f"# SUMMARY\nProvide a concise overview of what the course covers and its objectives.\n\n"
                                f"# CHAPTERS\nCreate 5-8 logically structured chapters. For each chapter:\n"
                                f"- Title: Clear and descriptive chapter title\n"
                                f"- Content: Detailed and comprehensive content with examples, explanations, and relevant concepts\n\n"
                                f"# FLASHCARDS\nCreate at least 15 flashcards in this format:\n"
                                f"- Question: [question text]\n"
                                f"- Answer: [answer text]\n\n"
                                f"# MCQs (Multiple Choice Questions)\nCreate at least 10 multiple choice questions in this format:\n"
                                f"- Question: [question text]\n"
                                f"- Options: a) [option text] b) [option text] c) [option text] d) [option text]\n"
                                f"- Correct Answer: [correct letter]\n\n"
                                f"# Q&A PAIRS\nCreate at least 10 question and answer pairs for deeper understanding:\n"
                                f"- Question: [detailed question]\n"
                                f"- Answer: [comprehensive answer]\n\n"
                                f"Ensure the course is educational, accurate, and tailored to {request_data['purpose']} at {request_data['difficulty']} level."
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 8192,
                }
            }
        elif action == 'generate_interview_questions':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Generate {request_data.get('questionCount', 5)} interview questions for a {request_data['experience']} years experienced {request_data['jobRole']} "
                                f"with expertise in {request_data['techStack']}. The questions should be challenging and relevant to the role.\n"
                                f"For each question:\n"
                                f"1. Focus on technical knowledge and practical application\n"
                                f"2. Test problem-solving abilities\n"
                                f"3. Include scenario-based questions\n"
                                f"4. Assess teamwork and collaboration skills\n"
                                f"Format as a numbered list."
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                }
            }
        elif action == 'analyze_interview':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Analyze this interview response for a {request_data['jobRole']} position. \n"
                                f"Question: {request_data['question']}\n"
                                f"Answer: {request_data['answer']}\n\n"
                                f"Provide detailed analysis in the following format:\n\n"
                                f"Technical Feedback: (Analyze understanding of technical concepts and accuracy)\n"
                                f"Communication Feedback: (Analyze clarity, structure, and language used)\n"
                                f"Strengths: (List 3 specific strengths in the response)\n"
                                f"Areas to Improve: (List 3 specific areas that could be improved)\n"
                                f"Overall Rating: (Give a rating between 0-100)"
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 2048,
                }
            }
        elif action == 'generate_flashcards':
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": f"Generate 20 detailed flashcards on the topic: {request_data['topic']} for {request_data['purpose']} at {request_data['difficulty']} level.\n"
                                f"Create flashcards in this exact format:\n\n"
                                f"# FLASHCARDS\n"
                                f"- Question: [Specific, clear question text]\n"
                                f"- Answer: [Comprehensive, accurate answer text]\n\n"
                                f"Make sure the flashcards cover key concepts, terms, principles, and applications related to the topic.\n"
                                f"Each answer should be detailed enough to provide complete understanding.\n"
                                f"Ensure varying difficulty levels across the flashcards to test different aspects of knowledge."
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,
                }
            }
        else:
            return jsonify({"success": False, "error": f"Unsupported action: {action}"}), 400
        
        # Generate content using the Gemini model
        response = model.generate_content(request_body)
        
        # Format the response to match the expected format from the edge function
        response_text = ""
        if hasattr(response, 'text'):
            response_text = response.text
        elif hasattr(response, 'parts'):
            response_text = response.parts[0].text

        return jsonify({
            "success": True, 
            "data": {
                "candidates": [
                    {
                        "content": {
                            "parts": [
                                {
                                    "text": response_text
                                }
                            ]
                        }
                    }
                ]
            }
        }), 200
    
    except Exception as e:
        print(f"Error in gemini_api: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Default port is 5000, but can be configured with an environment variable
    port = int(os.environ.get("PORT", 5000))
    
    # In production, set debug=False
    debug_mode = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
