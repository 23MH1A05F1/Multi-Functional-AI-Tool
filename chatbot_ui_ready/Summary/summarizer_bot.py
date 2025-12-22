from flask import Flask, request, jsonify, send_from_directory
from file_extractor import extract_text_from_file, get_transcript_from_url
from summarizer import summarize_text
import os

app = Flask(__name__, static_folder="frontend")

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/summarize-file', methods=['POST'])
def summarize_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400
    file = request.files['file']
    temp_path = os.path.join("temp_upload.pdf")
    file.save(temp_path)
    text, error = extract_text_from_file(temp_path)
    try:
        os.remove(temp_path)
    except Exception:
        pass
    if error:
        return jsonify({'error': error}), 400

    try:
        summary = summarize_text(text)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'summary': summary})

@app.route('/summarize-youtube', methods=['POST'])
def summarize_youtube():
    data = request.get_json()
    url = data.get('url', '')
    text, error = get_transcript_from_url(url)
    if error:
        return jsonify({'error': error}), 400

    try:
        summary = summarize_text(text)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'summary': summary})

if __name__ == "__main__":
    app.run(debug=True, port=5500)
