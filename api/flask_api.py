
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

        response = model.generate_content(request_body)
        return jsonify({"success": True, "data": response}), 200
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Default port is 5000, but can be configured with an environment variable
    port = int(os.environ.get("PORT", 5000))
    
    # In production, set debug=False
    debug_mode = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
