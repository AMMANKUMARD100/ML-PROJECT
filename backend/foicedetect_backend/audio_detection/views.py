import os
import json
import traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage

from .predict import analyze_audio
from .text_generate import transcribe_audio, generate_analysis, check_internet_connection
from .reply import generate_hilarious_reply

# List of supported audio extensions for broad compatibility
SUPPORTED_EXTENSIONS = ('.wav', '.mp3', '.flac', '.ogg', '.m4a')

@csrf_exempt
def detect_audio(request):
    """
    Core Voice Verification Endpoint.
    Executes voice deepfake classification 100% offline using local feature extraction.
    Uses online APIs for speech-to-text and AI analysis when available, with full offline fallbacks.
    """
    if request.method == 'POST':
        if 'file' not in request.FILES:
            return JsonResponse({'error': 'No file uploaded'}, status=400)
        
        file = request.FILES['file']
        file_ext = os.path.splitext(file.name.lower())[1]
        
        if file_ext not in SUPPORTED_EXTENSIONS:
            return JsonResponse({
                'error': f'Unsupported audio format. Please upload {", ".join(SUPPORTED_EXTENSIONS)}'
            }, status=400)
        
        upload_dir = 'uploads/'
        os.makedirs(upload_dir, exist_ok=True)
        full_path = os.path.join(upload_dir, file.name)
        
        try:
            with default_storage.open(full_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)
            
            # Offline voice classification (core feature)
            result = analyze_audio(full_path)
            if not result:
                raise ValueError("Could not analyze the provided audio file.")

            is_online = check_internet_connection()

            # Speech to text transcription
            try:
                speech_text = transcribe_audio(full_path)
            except Exception as transcription_error:
                speech_text = f"Transcription failed: {str(transcription_error)}"
            
            # AI or Rule-Based Security Analysis
            try:
                classification_result = f"The input audio is classified as {result[0]} with {result[1]:.2f}% confidence."
                ai_analysis = generate_analysis(speech_text, classification_result)
            except Exception as analysis_error:
                ai_analysis = f"Analysis generation failed: {str(analysis_error)}"
            
            # Clean up the uploaded audio file
            if os.path.exists(full_path):
                os.remove(full_path)
            
            return JsonResponse({
                'result': result[0],              # 'Genuine' or 'Deepfake'
                'confidence': result[1],          # Confidence score (0-100)
                'speech_to_text': speech_text,
                'ai_analysis': ai_analysis,
                'is_online': is_online,           # Informs UI whether online APIs or offline fallbacks were used
                'offline_mode': not is_online
            })
        
        except Exception as e:
            print("Full error traceback in detect_audio:")
            traceback.print_exc()
            if os.path.exists(full_path):
                os.remove(full_path)
            
            return JsonResponse({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def reply(request):
    """
    Anti-Scam Reply Generator.
    Works online with Groq LLM or offline using curated humorous responses.
    """
    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
            transcript = body.get("transcript", "")
            
            reply_text = generate_hilarious_reply(transcript)
            is_online = check_internet_connection()
            
            return JsonResponse({
                "reply": reply_text,
                "is_online": is_online
            }, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def health_status(request):
    """
    Returns application status and network connectivity information.
    """
    is_online = check_internet_connection()
    return JsonResponse({
        "status": "healthy",
        "app": "VoiceDetect",
        "is_online": is_online,
        "offline_ready": True
    })
