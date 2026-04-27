"""Voice API endpoints — Twilio webhook handlers"""
import json
import re
import uuid
from datetime import datetime

import httpx
from fastapi import APIRouter, Request, Response, UploadFile, File, Form, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from app.core.config import settings
from app.services.twilio_svc import create_welcome_twiml, create_response_twiml
from app.services.gemini import extract_intent_and_entities, generate_voice_response
from app.services.speech import transcribe_phone_audio
from app.services.intent_handler import handle_intent
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/voice", tags=["voice"])


VOICE_COLLECTION = "voice_commands"


class WebTTSRequest(BaseModel):
    text: str
    source: str = "web_tts"
    role: str = "admin"
    caller: str = "web_user"
    language_hint: str | None = None
    user_name: str | None = None


class WebSTTResponse(BaseModel):
    transcript: str
    language: str
    transcript_hinglish: str | None = None
    speech_style: str | None = None


async def _store_voice_command(payload: dict) -> str | None:
    voice_id = payload.get("id") or str(uuid.uuid4())
    payload["id"] = voice_id
    payload.setdefault("created_at", datetime.utcnow().isoformat())
    payload.setdefault("updated_at", payload["created_at"])
    payload.setdefault("status", "processed")
    await firestore_service.upsert_document(VOICE_COLLECTION, voice_id, payload)
    return voice_id


def _truncate_header_text(text: str | None, limit: int = 140) -> str:
    if not text:
        return ""
    clean_text = str(text).replace("\n", " ").strip()
    return clean_text[:limit]


def _safe_header_value(text: str | None, limit: int = 140) -> str:
    """Starlette response headers must be latin-1 encodable."""
    value = _truncate_header_text(text, limit=limit)
    if not value:
        return ""
    return value.encode("latin-1", errors="ignore").decode("latin-1")


def _sanitize_transcript_text(text: str | None, limit: int = 320) -> str:
    """Normalize STT text for chat input and remove model-added wrappers."""
    if not text:
        return ""

    cleaned = str(text).replace("\r", "\n").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:[a-zA-Z0-9_-]+)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)

    lines = [ln.strip() for ln in cleaned.split("\n") if ln.strip()]
    if not lines:
        return ""

    prefix_pattern = re.compile(
        r"^(transcript|transcription|recognized text|recognized speech|result)\s*[:\-]\s*",
        re.IGNORECASE,
    )
    normalized_lines = []
    for line in lines:
        line = prefix_pattern.sub("", line).strip(" \"'")
        if line:
            normalized_lines.append(line)

    if not normalized_lines:
        return ""

    cleaned = " ".join(normalized_lines)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if len(cleaned) > limit:
        cleaned = cleaned[:limit].rstrip()
    return cleaned


def _contains_devanagari(text: str) -> bool:
    return bool(re.search(r"[\u0900-\u097F]", text or ""))


HINGLISH_HINT_WORDS = {
    "mujhe", "mera", "meri", "bhai", "bhaiya", "nahi", "nhi", "haan", "haanji", "acha",
    "chahiye", "kitna", "kya", "ka", "ki", "ke", "aur", "par", "mein", "hai", "ho", "kar",
    "kr", "jaldi", "abhi", "thoda", "zyada", "kam", "sab", "theek", "thik", "bhijwa", "bhejo",
    "stock", "maal", "bhejna", "price", "rate", "rupaye", "rupee", "order", "deal",
}


def _detect_speech_style(text: str) -> str:
    """Best-effort detection for Hindi script vs Roman Hinglish vs English."""
    cleaned = (text or "").strip().lower()
    if not cleaned:
        return "english"
    if _contains_devanagari(cleaned):
        return "hindi"

    words = re.findall(r"[a-zA-Z']+", cleaned)
    if not words:
        return "english"

    hint_hits = sum(1 for w in words if w in HINGLISH_HINT_WORDS)
    if hint_hits >= 2:
        return "hinglish"
    if hint_hits == 1 and len(words) <= 6:
        return "hinglish"
    return "english"


async def _transliterate_to_hinglish(text: str) -> str:
    """Convert Hindi/Devanagari transcript to Roman Hinglish for chat UX."""
    if not text.strip() or not settings.GOOGLE_AI_API_KEY:
        return text

    prompt = (
        "Transliterate the following Hindi text into natural Hinglish in Roman script. "
        "Return only transliterated text. Do not translate meaning, do not add extra words, "
        "do not use Devanagari. Keep numbers, product names, and units intact.\n\n"
        f"Text: {text}"
    )

    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.1}}
    headers = {"Content-Type": "application/json", "X-goog-api-key": settings.GOOGLE_AI_API_KEY}
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-4b-it:generateContent"

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
        if response.status_code >= 400:
            return text

        data = response.json()
        candidates = data.get("candidates") or []
        if not candidates:
            return text
        parts = candidates[0].get("content", {}).get("parts", [])
        transliterated = "".join(part.get("text", "") for part in parts).strip()
        transliterated = _sanitize_transcript_text(transliterated)
        return transliterated or text
    except Exception:
        return text


@router.post("/welcome")
async def voice_welcome():
    """Initial webhook for incoming Twilio calls"""
    twiml = create_welcome_twiml()
    return PlainTextResponse(content=twiml, media_type="application/xml")


@router.post("/process")
async def process_voice(request: Request):
    """Process voice input from Twilio Gather"""
    form = await request.form()
    speech_result = form.get("SpeechResult", "")
    caller = form.get("From", "")
    call_sid = form.get("CallSid", "")

    if not speech_result:
        twiml = create_response_twiml(
            "Mujhe samajh nahi aaya. Kripya dobara bolein.", "hi"
        )
        return PlainTextResponse(content=twiml, media_type="application/xml")

    try:
        # Extract intent using Gemini
        result = await extract_intent_and_entities(speech_result)
        intent = result.get("intent", "unknown")
        entities = result.get("entities", {})
        language = result.get("language_detected", "hi")

        # Process the intent
        action_result = await handle_intent(intent, entities, caller)

        # Generate voice response
        response_text = await generate_voice_response(intent, action_result, language)
        twiml = create_response_twiml(response_text, language)

    except Exception as e:
        twiml = create_response_twiml(
            "Maaf kijiye, kuch technical problem hai. Kripya thodi der baad try karein.",
            "hi",
        )

    return PlainTextResponse(content=twiml, media_type="application/xml")


@router.post("/tts")
async def process_web_tts(payload: WebTTSRequest):
    """Generate TTS audio bytes for web dashboard using GCP voice."""
    from app.services.speech import tts_process

    text = (payload.text or "").strip()
    if not text:
        return Response(status_code=400, content="Text is required")

    try:
        response_audio = await tts_process(text)
        headers = {"X-Voice-Reply": _safe_header_value(text)}
        return Response(content=response_audio, media_type="audio/mpeg", headers=headers)
    except Exception as e:
        print(f"[ERROR] Web TTS failed: {str(e)}")
        return Response(status_code=500, content="TTS processing failed")


@router.post("/stt", response_model=WebSTTResponse)
async def process_web_stt(
    audio: UploadFile = File(...),
    language_hint: str | None = Form(None),
    output_mode: str | None = Form(None),
):
    """Transcribe uploaded web audio and return plain text."""
    from app.services.speech import stt_process

    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio upload")

        language = language_hint or "hi-IN"
        transcript = await stt_process(audio_bytes, language)

        if transcript.startswith("Sorry, I encountered an error processing your speech"):
            raise HTTPException(status_code=500, detail=transcript)

        if transcript.startswith("I couldn't understand") or transcript.startswith("I didn't receive"):
            raise HTTPException(status_code=422, detail=transcript)

        transcript = _sanitize_transcript_text(transcript)
        if not transcript:
            raise HTTPException(status_code=422, detail="No speech was detected. Please try again.")

        speech_style = _detect_speech_style(transcript)
        transcript_hinglish: str | None = None
        if (output_mode or "").lower() == "hinglish":
            transcript_hinglish = await _transliterate_to_hinglish(transcript) if _contains_devanagari(transcript) else transcript

        return WebSTTResponse(
            transcript=transcript,
            language=language,
            transcript_hinglish=transcript_hinglish,
            speech_style=speech_style,
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Web STT failed: {str(e)}")
        raise HTTPException(status_code=500, detail="STT processing failed")

@router.post("/web")
async def process_web_voice(
    audio: UploadFile = File(...),
    source: str = Form("worker_dashboard"),
    role: str = Form("worker"),
    caller: str = Form("web_user"),
    language_hint: str | None = Form(None),
    user_name: str | None = Form(None),
):
    """Process voice input from the web dashboard"""
    from app.services.speech import stt_process, tts_process
    
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            return Response(status_code=400, content="Empty audio upload")

        stt_result = await stt_process(audio_bytes, language_hint or "hi-IN")
        if stt_result.startswith("Sorry, I encountered an error processing your speech") or stt_result.startswith("I couldn't understand"):
            fallback_text = "Sorry, I could not understand the audio. Please try again."
            fallback_audio = await tts_process(fallback_text)
            await _store_voice_command({
                "source": source,
                "role": role,
                "caller": caller,
                "user_name": user_name,
                "audio_file_name": audio.filename,
                "audio_content_type": audio.content_type,
                "transcript": stt_result,
                "intent": "unknown",
                "entities": {},
                "language": language_hint or "hi-IN",
                "confidence": 0,
                "response": fallback_text,
                "status": "failed",
                "error_message": stt_result,
            })
            return Response(content=fallback_audio, media_type="audio/mpeg")
        
        result = await extract_intent_and_entities(stt_result)
        intent = result.get("intent", "unknown")
        entities = result.get("entities", {})
        language = result.get("language_detected", "hi")
        
        # We can use a generic caller id for the web dashboard or extract from token
        action_result = await handle_intent(intent, entities, caller)
        
        response_text = await generate_voice_response(intent, action_result, language)
        response_audio = await tts_process(response_text)

        activity_summary = action_result.get("message") or action_result.get("activity")
        if not activity_summary:
            if intent == "stock_arrival":
                inventory_item = action_result.get("inventory_item", {})
                activity_summary = (
                    f"Added {inventory_item.get('current_stock', entities.get('quantity', 0))} {inventory_item.get('unit', 'units')} "
                    f"of {inventory_item.get('product_name', stt_result)} to inventory"
                )
            else:
                activity_summary = f"Performed {intent.replace('_', ' ')}"

        voice_record = {
            "source": source,
            "role": role,
            "caller": caller,
            "user_name": user_name,
            "audio_file_name": audio.filename,
            "audio_content_type": audio.content_type,
            "transcript": stt_result,
            "intent": intent,
            "entities": entities,
            "language": language,
            "confidence": result.get("confidence"),
            "response": response_text,
            "action_result": action_result,
            "activity_summary": activity_summary,
            "status": "processed",
        }
        call_id = await _store_voice_command(voice_record)
        
        headers = {}
        if call_id:
            headers["X-Voice-Command-Id"] = call_id
        headers["X-Voice-Intent"] = intent
        headers["X-Voice-Language"] = language
        headers["X-Voice-Reply"] = _safe_header_value(response_text)
        headers["X-Voice-Activity"] = _safe_header_value(activity_summary)

        return Response(content=response_audio, media_type="audio/mpeg", headers=headers)
        
    except Exception as e:
        print(f"[ERROR] Web voice processing failed: {str(e)}")
        failure_record = {
            "source": source,
            "role": role,
            "caller": caller,
            "user_name": user_name,
            "audio_file_name": audio.filename if audio else None,
            "audio_content_type": audio.content_type if audio else None,
            "transcript": None,
            "intent": "unknown",
            "entities": {},
            "language": language_hint or "hi-IN",
            "response": None,
            "status": "failed",
            "error_message": str(e),
                "activity_summary": "Voice entry failed",
        }
        await _store_voice_command(failure_record)
        return Response(status_code=500, content="Voice processing failed")
