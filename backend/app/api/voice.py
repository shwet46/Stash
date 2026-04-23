"""Voice API endpoints — Twilio webhook handlers"""
from fastapi import APIRouter, Request, Response
from fastapi.responses import PlainTextResponse
from app.services.twilio_svc import create_welcome_twiml, create_response_twiml
from app.services.gemini import extract_intent_and_entities, generate_voice_response
from app.services.speech import transcribe_phone_audio

router = APIRouter(prefix="/api/voice", tags=["voice"])


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


async def handle_intent(intent: str, entities: dict, caller: str) -> dict:
    """Route intent to appropriate handler"""
    handlers = {
        "stock_arrival": handle_stock_arrival,
        "stock_query": handle_stock_query,
        "order_placed": handle_order_placed,
        "order_status": handle_order_status,
        "price_offer": handle_price_offer,
        "delivery_query": handle_delivery_query,
        "cancel_order": handle_cancel_order,
    }

    handler = handlers.get(intent, handle_unknown)
    return await handler(entities, caller)


async def handle_stock_arrival(entities: dict, caller: str) -> dict:
    """Handle stock arrival voice command"""
    return {
        "status": "success",
        "message": f"Stock updated: {entities.get('product', 'item')} +"
        f"{entities.get('quantity', 0)} {entities.get('unit', 'units')}",
        "product": entities.get("product"),
        "quantity": entities.get("quantity"),
    }


async def handle_stock_query(entities: dict, caller: str) -> dict:
    """Handle stock query voice command"""
    return {
        "status": "success",
        "product": entities.get("product", "unknown"),
        "current_stock": 450,
        "unit": "kg",
        "threshold": 100,
    }


async def handle_order_placed(entities: dict, caller: str) -> dict:
    """Handle new order via voice"""
    return {
        "status": "success",
        "order_ref": "STH-4833",
        "product": entities.get("product"),
        "quantity": entities.get("quantity"),
    }


async def handle_order_status(entities: dict, caller: str) -> dict:
    """Handle order status query"""
    return {
        "status": "success",
        "order_ref": entities.get("order_id", "STH-4830"),
        "order_status": "dispatched",
        "eta": "tomorrow",
    }


async def handle_price_offer(entities: dict, caller: str) -> dict:
    """Handle price negotiation via voice"""
    return {
        "status": "negotiating",
        "offered_price": entities.get("price"),
        "product": entities.get("product"),
    }


async def handle_delivery_query(entities: dict, caller: str) -> dict:
    """Handle delivery status query"""
    return {
        "status": "success",
        "order_ref": entities.get("order_id"),
        "delivery_status": "in_transit",
        "eta": "2 hours",
    }


async def handle_cancel_order(entities: dict, caller: str) -> dict:
    """Handle order cancellation"""
    return {
        "status": "cancelled",
        "order_ref": entities.get("order_id"),
    }


async def handle_unknown(entities: dict, caller: str) -> dict:
    """Handle unrecognized intent"""
    return {"status": "unknown", "message": "Intent not recognized"}
