"""Voice API endpoints — Twilio webhook handlers"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Request, Response, UploadFile, File, Form
from fastapi.responses import PlainTextResponse
from app.services.twilio_svc import create_welcome_twiml, create_response_twiml
from app.services.gemini import extract_intent_and_entities, generate_voice_response
from app.services.speech import transcribe_phone_audio
from app.services.intent_handler import handle_intent
from app.services.firestore_service import firestore_service

router = APIRouter(prefix="/api/voice", tags=["voice"])


VOICE_COLLECTION = "voice_commands"


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
        headers["X-Voice-Reply"] = _truncate_header_text(response_text)
        headers["X-Voice-Activity"] = _truncate_header_text(activity_summary)

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
