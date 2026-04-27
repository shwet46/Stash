"""Gemini REST client — NLP, intent extraction, negotiation, and text generation"""
import json
import re

import httpx

from app.core.config import settings

GEMINI_MODEL = "gemma-3-4b-it"
GEMINI_ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
)


class GeminiAPIError(RuntimeError):
    pass


async def _generate_content(prompt: str) -> str:
    if not settings.GOOGLE_AI_API_KEY:
        raise GeminiAPIError("GOOGLE_AI_API_KEY is not configured")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt,
                    }
                ]
            }
        ]
    }

    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": settings.GOOGLE_AI_API_KEY,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(GEMINI_ENDPOINT, headers=headers, json=payload)

    if response.status_code >= 400:
        raise GeminiAPIError(
            f"Gemini API request failed ({response.status_code}): {response.text}"
        )

    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        raise GeminiAPIError("Gemini API returned no candidates")

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "".join(part.get("text", "") for part in parts).strip()
    if not text:
        raise GeminiAPIError("Gemini API returned empty text")

    return text


def _extract_json(text: str) -> dict:
    """Parse JSON returned by Gemini, tolerating fenced blocks."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return json.loads(cleaned)


async def extract_intent_and_entities(transcript: str) -> dict:
    """Extract intent and entities from a voice transcript (Hindi/English/Hinglish)"""
    prompt = """You are Stash, an AI godown management assistant for India.
    Extract the intent and entities from this voice transcript.
    The transcript may be in Hindi, English, or Hinglish (code-switched).

    Return ONLY valid JSON with this structure:
    {
      "intent": "stock_arrival|order_placed|order_status|price_offer|delivery_query|cancel_order|stock_query",
      "entities": {
        "product": "string or null",
        "quantity": "number or null",
        "lot_number": "string or null",
        "expiry_date": "YYYY-MM-DD or null",
        "price": "number or null",
        "order_id": "string or null",
        "phone": "string or null"
      },
      "language_detected": "hi|en|hinglish",
      "confidence": 0.0-1.0
    }

    Transcript: """ + transcript

    response_text = await _generate_content(prompt)
    return _extract_json(response_text)


async def negotiate_price(
    product: str,
    offered_price: float,
    floor: float,
    ceiling: float,
    market_rate: float,
    language: str = "hi",
) -> dict:
    """AI price negotiation with 4-tier strategy"""
    prompt = f"""You are a price negotiation AI for Stash godown management.
    Negotiate price for: {product}
    Buyer offered: ₹{offered_price}
    Your floor price: ₹{floor}
    Your ceiling/target: ₹{ceiling}
    Current market rate: ₹{market_rate}

    Apply this 4-tier strategy:
    Tier 1: offered >= market_rate → accept immediately
    Tier 2: floor <= offered < market_rate → accept with minimum quantity condition
    Tier 3: offered < floor but > floor*0.9 → counter at floor+5%, add urgency
    Tier 4: offered < floor*0.9 → hard refuse politely

    Respond in {language}. Return JSON:
    {{
      "decision": "accept|counter|refuse",
      "counter_price": number or null,
      "message": "spoken response in {language}",
      "minimum_quantity": number or null
    }}"""

    response_text = await _generate_content(prompt)
    return _extract_json(response_text)


async def generate_telegram_message(
    context: str, buyer_name: str, language_code: str = "en"
) -> str:
    """Generate a personalized Telegram message in the buyer's language"""
    lang_map = {
        "hi": "Hindi",
        "ta": "Tamil",
        "te": "Telugu",
        "bn": "Bengali",
        "mr": "Marathi",
        "gu": "Gujarati",
        "kn": "Kannada",
        "ml": "Malayalam",
        "pa": "Punjabi",
        "or": "Odia",
        "en": "English",
    }
    language = lang_map.get(language_code, "English")

    prompt = f"""Generate a friendly, professional Telegram message for a godown customer.
    Customer name: {buyer_name}
    Context: {context}
    Language: {language}
    Keep it concise, warm, and use the customer's name naturally.
    Use HTML formatting (bold with <b>, code with <code>).
    Do not use markdown."""

    return await _generate_content(prompt)


async def generate_voice_response(
    intent: str, result: dict, language: str = "hi"
) -> str:
    """Generate natural spoken response for voice call"""
    prompt = f"""Generate a natural spoken response for a voice call system.
    Intent handled: {intent}
    Result data: {json.dumps(result)}
    Language: {"Hindi" if language == "hi" else "English"}
    Keep it under 30 words. Natural, conversational. No punctuation that sounds odd when spoken."""

    return await _generate_content(prompt)


async def summarize_disruption_for_owner(alerts: list) -> str:
    """Summarize supply chain disruption alerts"""
    prompt = f"""Summarize these supply chain disruption alerts for a godown owner in 2-3 sentences.
    Be specific about products, quantities, and recommended actions.
    Alerts: {json.dumps(alerts)}"""

    return await _generate_content(prompt)
