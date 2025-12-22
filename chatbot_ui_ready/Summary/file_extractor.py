import os
from PyPDF2 import PdfReader

def extract_text_from_file(path):
    """Extract text from a PDF file. Returns (text, error)."""
    try:
        reader = PdfReader(path)
        texts = []
        for page in reader.pages:
            try:
                texts.append(page.extract_text() or "")
            except Exception:
                # Continue on page extraction error
                continue
        text = "\n".join(texts).strip()
        if not text:
            return None, "No extractable text found in PDF."
        return text, None
    except Exception as e:
        return None, f"Failed to extract PDF text: {str(e)}"

def get_transcript_from_url(url):
    """Attempt to fetch YouTube transcript using youtube-transcript-api.
    Returns (text, error). If the library is not available or transcript not found, returns an error message."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        # extract video id naive approach
        if 'watch?v=' in url:
            video_id = url.split('watch?v=')[-1].split('&')[0]
        elif 'youtu.be/' in url:
            video_id = url.split('youtu.be/')[-1].split('?')[0]
        else:
            return None, "Not a valid YouTube URL."

        try:
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            # join text segments
            text = " ".join([seg.get('text', '') for seg in transcript_list])
            if not text.strip():
                return None, "Transcript is empty or unavailable."
            return text, None
        except Exception as e:
            return None, f"Could not fetch transcript: {str(e)}"
    except Exception:
        return None, "youtube-transcript-api not installed or failed. Install it with: pip install youtube-transcript-api"
