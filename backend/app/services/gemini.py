"""Gemini 3.0 Flash client — NLP, intent extraction, negotiation, and text generation"""
import json
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")


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

    response = await model.generate_content_async(prompt)
    return json.loads(response.text)


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

    response = await model.generate_content_async(prompt)
    return json.loads(response.text)


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

    response = await model.generate_content_async(prompt)
    return response.text


async def generate_voice_response(
    intent: str, result: dict, language: str = "hi"
) -> str:
    """Generate natural spoken response for voice call"""
    prompt = f"""Generate a natural spoken response for a voice call system.
    Intent handled: {intent}
    Result data: {json.dumps(result)}
    Language: {"Hindi" if language == "hi" else "English"}
    Keep it under 30 words. Natural, conversational. No punctuation that sounds odd when spoken."""

    response = await model.generate_content_async(prompt)
    return response.text


async def summarize_disruption_for_owner(alerts: list) -> str:
    """Summarize supply chain disruption alerts"""
    prompt = f"""Summarize these supply chain disruption alerts for a godown owner in 2-3 sentences.
    Be specific about products, quantities, and recommended actions.
    Alerts: {json.dumps(alerts)}"""

    response = await model.generate_content_async(prompt)
    return response.text
