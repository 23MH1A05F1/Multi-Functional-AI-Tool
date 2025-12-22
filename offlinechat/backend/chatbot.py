import os


import google.generativeai as genai

# --- Flask Integration ---
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyCMARmKBMDcRAIH9TROQi8UNKKRdG1rLmM"  # <-- Your Gemini API key
genai.configure(api_key=API_KEY)
 

# Example placeholder for your API logic
def get_bot_reply(user_input):
    if not user_input.strip():
        return "Please enter a message."
    try:
        model = genai.GenerativeModel('gemini-pro')
        convo = model.start_chat(history=[])
        convo.send_message(user_input)
        return convo.last.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/api/message', methods=['POST'])
def message():
    data = request.get_json()
    user_message = data.get('message', '')
    reply = get_bot_reply(user_message)
    return jsonify({'reply': reply})

if __name__ == '__main__':
    app.run(debug=True)