import pyttsx3

def speak_text(text):
    """
    Convert text to speech and speak it aloud.
    """
    try:
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f'Error in text-to-speech: {str(e)}')
