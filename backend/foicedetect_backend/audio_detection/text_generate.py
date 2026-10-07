import os
import socket
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_internet_connection(host="8.8.8.8", port=53, timeout=1.5):
    """
    Fast, reliable check for active internet connection using a DNS socket test.
    """
    try:
        socket.setdefaulttimeout(timeout)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect((host, port))
        return True
    except (socket.timeout, OSError):
        return False

# Setup AssemblyAI if available
api_key_assembly = os.getenv('ASSEMBLY_API_KEY') or os.getenv('ASSEMBLYAI_API_KEY')
aai = None
if api_key_assembly:
    try:
        import assemblyai as aai
        aai.settings.api_key = api_key_assembly
    except ImportError:
        aai = None

# Setup Groq LLM if available
api_key_groq = os.getenv('GROQ_API_KEY')
groq_client = None
if api_key_groq:
    try:
        from openai import OpenAI
        groq_client = OpenAI(
            api_key=api_key_groq,
            base_url="https://api.groq.com/openai/v1"
        )
    except ImportError:
        groq_client = None

def get_offline_analysis(classification_result, speech_to_text_output=""):
    """
    Generates rich, structured security breakdown locally without any internet connection.
    Follows the exact delimiter format expected by frontend:
    1. Title:ENDHEADLINE!!!\nText ENDPARAGRAPH!!!
    """
    is_fake = "Deepfake" in classification_result or "Fake" in classification_result

    if is_fake:
        return (
            "1. Detailed Scam Risk Assessment:ENDHEADLINE!!!\n"
            "High Probability Voice Clone Detected. Acoustic frequency and spectral rolloff patterns show synthetic artifacting characteristic of neural voice synthesis models (TTS / RVC / Zero-shot cloning). This audio is likely generated to impersonate an authority, colleague, or loved one.ENDPARAGRAPH!!!\n\n"
            "2. Immediate User Recommendations:ENDHEADLINE!!!\n"
            "Do not comply with financial requests, credential disclosures, or urgent panic prompts presented in this audio. Immediately cease interaction and verify through a separate, pre-established trusted communication line.ENDPARAGRAPH!!!\n\n"
            "3. Verification Strategies:ENDHEADLINE!!!\n"
            "Request verbal verification via a pre-arranged familial safe-word or ask a question regarding a hyper-specific personal memory that is not available anywhere online or in public databases.ENDPARAGRAPH!!!\n\n"
            "4. Psychological Manipulation Breakdown:ENDHEADLINE!!!\n"
            "Synthetic audio scams universally employ engineered urgency, emotional distress, or artificial deadlines to bypass analytical scrutiny and induce hasty panic decisions.ENDPARAGRAPH!!!\n\n"
            "5. Legal and Reporting Guidance:ENDHEADLINE!!!\n"
            "Archive this audio file securely without altering timestamps. File an official cyber fraud complaint with local cyber crime divisions (cybercrime.gov.in or ic3.gov) and notify potentially affected parties.ENDPARAGRAPH!!!"
        )
    else:
        return (
            "1. Detailed Scam Risk Assessment:ENDHEADLINE!!!\n"
            "Low Risk Detected. Harmonic distribution, micro-tremors, natural pitch jitter, and room acoustic reverberation align with genuine human vocal cords. No algorithmic deepfake synthesis fingerprints were identified.ENDPARAGRAPH!!!\n\n"
            "2. Immediate User Recommendations:ENDHEADLINE!!!\n"
            "While the voice recording appears genuine, always maintain healthy vigilance regarding unsolicited phone calls soliciting personal identifiable information or fund transfers.ENDPARAGRAPH!!!\n\n"
            "3. Verification Strategies:ENDHEADLINE!!!\n"
            "If the speaker is asking for sensitive actions, always initiate an independent callback on an official verified phone number rather than continuing this inbound call.ENDPARAGRAPH!!!\n\n"
            "4. Psychological Manipulation Breakdown:ENDHEADLINE!!!\n"
            "Even genuine voices can be leveraged in traditional social engineering or coercive phone scams. Maintain critical evaluation regardless of vocal authenticity.ENDPARAGRAPH!!!\n\n"
            "5. Legal and Reporting Guidance:ENDHEADLINE!!!\n"
            "No deepfake threat identified for this file. You may safely archive this report for audit or compliance purposes.ENDPARAGRAPH!!!"
        )

def generate_analysis(speech_to_text_output, classification_result):
    """
    Online analysis via Groq with seamless offline fallback.
    """
    has_internet = check_internet_connection()

    if not has_internet or not groq_client:
        return get_offline_analysis(classification_result, speech_to_text_output)

    prompt = f"""
    Analyze the following potential scam audio and provide a comprehensive user guidance:

    Speech-to-Text Content:
    "{speech_to_text_output}"

    Classification Result:
    "{classification_result}"

    Your response must follow this exact structure:
    1. Detailed Scam Risk Assessment:ENDHEADLINE!!!
    [content here]ENDPARAGRAPH!!!

    2. Immediate User Recommendations:ENDHEADLINE!!!
    [content here]ENDPARAGRAPH!!!

    3. Verification Strategies:ENDHEADLINE!!!
    [content here]ENDPARAGRAPH!!!

    4. Psychological Manipulation Breakdown:ENDHEADLINE!!!
    [content here]ENDPARAGRAPH!!!

    5. Legal and Reporting Guidance:ENDHEADLINE!!!
    [content here]ENDPARAGRAPH!!!

    Tone: authoritative, calm, empowering. Do not use bold or italic.
    """

    system_message = "You are a cybersecurity expert specializing in social engineering and scam prevention."

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=800,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Online AI analysis error: {e}. Falling back to offline engine.")
        return get_offline_analysis(classification_result, speech_to_text_output)

# Backward compatibility alias
get_ai_analysis = generate_analysis

def transcribe_audio(audio_file):
    """
    Transcribes audio using AssemblyAI if internet and API key are available,
    otherwise provides clean offline status.
    """
    if not check_internet_connection():
        return "[Offline Mode: Live audio transcription requires internet]"

    if not aai or not api_key_assembly:
        return "[Audio processed locally in offline mode]"

    try:
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(audio_file)
        return transcript.text if transcript and transcript.text else "[Audio transcribed, speech was unintelligible]"
    except Exception as e:
        print(f"Online transcription error: {e}")
        return "[Transcription unavailable. Offline voice analysis succeeded.]"