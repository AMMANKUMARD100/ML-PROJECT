import os
import random
from dotenv import load_dotenv
from .text_generate import check_internet_connection

# Load environment variables
load_dotenv()

# Initialize Groq client
api_key_groq = os.getenv('GROQ_API_KEY')
client = None
if api_key_groq:
    try:
        from openai import OpenAI
        client = OpenAI(
            api_key=api_key_groq,
            base_url="https://api.groq.com/openai/v1"
        )
    except ImportError:
        client = None

OFFLINE_FALLBACK_REPLIES = [
    "I just verified with my department's quantum encrypted ledger, and your transaction ID doesn't correlate with our timeline. Please hold while I consult our carrier pigeon.",
    "Interesting proposal! However, my grandmother's toaster requires a signed affidavit in Morse code before I can authorize any transfer. Did you bring the butter?",
    "Before we proceed, could you please confirm your official Intergalactic Protocol Number? My security toaster refuses to authenticate unverified wavelengths.",
    "I understand the urgency! I am currently filing a Form 27-B with the ministry of fictional departments. Expect our telegram in 3 to 5 business centuries.",
    "My supervisor, who is currently a certified penguin, insists that all confidential requests be made exclusively in reverse pig Latin. Whenever you're ready!",
    "Thank you for contacting Voice Verification Security. Your call has been logged, recorded, and flagged with biometric deepfake signatures. Have a wonderful day!"
]

def generate_hilarious_reply(transcript_text):
    """
    Generate a humorous anti-scam reply using Groq LLM when online,
    or a curated offline comedic retort when offline.
    """
    has_internet = check_internet_connection()

    if not has_internet or not client:
        return random.choice(OFFLINE_FALLBACK_REPLIES)

    prompt = f"""
    The following is a transcript of a scammer trying to trick someone:
    "{transcript_text}"

    Your task is to craft a short reply (200 words max) that will completely confuse, shock, and humorously stun the scammer. 
    Use absurd logic, overly complex reasoning, and sprinkle in random but funny facts that make no sense in the context. 
    The reply should leave the scammer speechless and questioning their own choices in life.

    If the transcript is "[No Transcript. Audio unintelligible.]" or references offline mode, just give a general hilarious response to a phone scammer.

    Keep the tone witty, sarcastic, and a little over-the-top, but avoid being rude or offensive.    

    Go straight to the reply to the scammer.
    """

    system_message = "You are a comedic genius specializing in scammer confusion."

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=300,
        )
        reply = response.choices[0].message.content.strip()
        return reply
    except Exception as e:
        print(f"Groq API error in generate_hilarious_reply: {e}. Using offline fallback reply.")
        return random.choice(OFFLINE_FALLBACK_REPLIES)