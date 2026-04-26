import os
import re
from google.cloud import speech_v2, texttospeech
from app.core.config import settings

GCP_PROJECT_ID = settings.GOOGLE_CLOUD_PROJECT
REGION = "global"

if not GCP_PROJECT_ID:
    raise ValueError(
        "CRITICAL: GCP_PROJECT_ID is not set in settings."
    )

async def stt_process(audio_bytes: bytes, language_code: str = "hi-IN") -> str:
    """Transcribe audio bytes using Google Cloud Speech-to-Text v2"""
    if not audio_bytes:
        print("[ERROR] Input audio bytes are empty")
        return "I didn't receive any audio."
    
    print(f"[DEBUG] Received {len(audio_bytes)} bytes of audio")
    
    try:
        client = speech_v2.SpeechAsyncClient()
        preferred_languages = [language_code, "hi-IN", "en-IN", "mr-IN"]
        language_codes: list[str] = []
        for code in preferred_languages:
            if code and code not in language_codes:
                language_codes.append(code)
            if len(language_codes) == 3:
                break
        
        config = speech_v2.RecognitionConfig(
            auto_decoding_config=speech_v2.AutoDetectDecodingConfig(),
            language_codes=language_codes,
            model="latest_long",
            features=speech_v2.RecognitionFeatures(
                enable_word_time_offsets=True,
            ),
        )
        
        request = speech_v2.RecognizeRequest(
            recognizer=f"projects/{GCP_PROJECT_ID}/locations/global/recognizers/_",
            config=config,
            content=audio_bytes,
        )
        
        response = await client.recognize(request=request)
        
        transcripts = [
            r.alternatives[0].transcript
            for r in response.results
            if r.alternatives
        ]
        
        if not transcripts:
            print("[WARN] No speech detected in audio")
            return "I couldn't understand any speech in the audio. Please try speaking more clearly."
        
        result = " ".join(transcripts).strip()
        
        if not result:
            print("[WARN] Transcription resulted in empty string")
            return "I couldn't understand what was said. Please try again."
        
        print(f"[DEBUG] Transcription: {result}")
        return result
        
    except Exception as e:
        print(f"[ERROR] Speech-to-text failed: {str(e)}")
        return "Sorry, I encountered an error processing your speech."

async def transcribe_phone_audio(audio_url: str, language_code: str = "hi-IN") -> str:
    """Transcribe audio from a Twilio recording URL"""
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.get(audio_url)
        audio_content = response.content

    return await stt_process(audio_content, language_code)

def detect_language(text: str) -> str:
    if not text:
        return "en-IN"
    devanagari_count = sum(1 for ch in text if '\u0900' <= ch <= '\u097F')
    if (devanagari_count / len(text)) > 0.2:
        return "hi-IN"
    return "en-IN"

def strip_markdown(text: str) -> str:
    if not text:
        return text
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'__(.+?)__', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    text = re.sub(r'~~(.+?)~~', r'\1', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    text = re.sub(r'!\[.*?\]\(.+?\)', '', text)
    text = re.sub(r'^[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[\s]*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^[\s]*\d+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()

def truncate_text_for_tts(text: str, max_bytes: int = 4500) -> str:
    if not text:
        return text
    text = str(text)
    text_bytes = text.encode('utf-8')
    if len(text_bytes) <= max_bytes:
        return text
    print(f"[WARN] Text too long ({len(text_bytes)} bytes), truncating to {max_bytes} bytes")
    sentences = text.replace('।', '.').split('.') 
    truncated = ""
    for sentence in sentences:
        test_text = truncated + sentence + "."
        if len(test_text.encode('utf-8')) > max_bytes:
            break
        truncated = test_text
    if not truncated:
        while len(text.encode('utf-8')) > max_bytes:
            text = text[:-1]
        truncated = text + "..."
    return truncated.strip()

async def tts_process(text: str) -> bytes:
    if text is None:
        text = "I have nothing to say."
    if not isinstance(text, str):
        text = str(text)
    if not text.strip():
        text = "I have nothing to say."
    text = strip_markdown(text.strip())
    text = truncate_text_for_tts(text)
    lang = detect_language(text)
    voice_map = {"hi-IN": "hi-IN-Wavenet-D", "en-IN": "en-IN-Wavenet-D"}
    try:
        client = texttospeech.TextToSpeechAsyncClient()
        response = await client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=text),
            voice=texttospeech.VoiceSelectionParams(language_code=lang, name=voice_map[lang]),
            audio_config=texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=1.0,
                pitch=0.0,
                effects_profile_id=["telephony-class-application"],
            ),
        )
        if not response.audio_content:
            raise ValueError("TTS returned empty audio content")
        return response.audio_content
    except Exception as e:
        print(f"[ERROR] Text-to-speech failed: {str(e)}")
        raise
