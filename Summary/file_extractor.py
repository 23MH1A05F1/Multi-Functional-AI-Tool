import pdfplumber
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

def extract_text_from_file(file_path):
    """
    Extract text from a PDF file.
    Returns (extracted_text, error) where error is None on success.
    """
    try:
        with pdfplumber.open(file_path) as pdf:
            text = ''
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + '\n'
        if not text.strip():
            return '', 'No text could be extracted from the file.'
        return text.strip(), None
    except Exception as e:
        return '', f'Error extracting text from file: {str(e)}'

def get_transcript_from_url(youtube_url):
    """
    Get transcript from a YouTube video URL.
    Returns (transcript_text, error) where error is None on success.
    """
    try:
        # Extract video ID from URL
        if 'v=' in youtube_url:
            video_id = youtube_url.split('v=')[1].split('&')[0]
        else:
            return '', 'Invalid YouTube URL format.'

        # Get transcript
        transcript_list = YouTubeTranscriptApi().fetch(video_id)

        # Format transcript
        formatter = TextFormatter()
        transcript_text = formatter.format_transcript(transcript_list)

        if not transcript_text.strip():
            return '', 'No transcript available for this video.'

        return transcript_text.strip(), None
    except Exception as e:
        return '', f'Error getting transcript: {str(e)}'