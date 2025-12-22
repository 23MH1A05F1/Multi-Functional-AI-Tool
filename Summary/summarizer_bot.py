import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

# Create app
app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/summarize-file', methods=['POST'])
def summarize_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded.'}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'error': 'Empty filename.'}), 400

    # Save to a temporary file
    fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(uploaded_file.filename)[1] or '.pdf')
    os.close(fd)
    try:
        # Import locally to avoid heavy dependencies during startup
        from file_extractor import extract_text_from_file

        uploaded_file.save(temp_path)
        text, error = extract_text_from_file(temp_path)
        if error:
            return jsonify({'error': error}), 400

        try:
            # Import summarizer lazily to avoid loading ML model on startup
            from summarizer import summarize_text

            summary = summarize_text(text)
        except Exception as e:
            return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

        return jsonify({'summary': summary})
    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass


@app.route('/summarize-youtube', methods=['POST'])
def summarize_youtube():
    data = request.get_json() or {}
    url = data.get('url', '')
    if not url:
        return jsonify({'error': 'No URL provided.'}), 400

    # Import helper lazily
    from file_extractor import get_transcript_from_url

    text, error = get_transcript_from_url(url)
    if error:
        return jsonify({'error': error}), 400

    try:
        from summarizer import summarize_text

        summary = summarize_text(text)
    except Exception as e:
        return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

    return jsonify({'summary': summary})


if __name__ == '__main__':
    # Default port 5001 to avoid clashing with other local servers
    app.run(host='0.0.0.0', port=5001, debug=True)
