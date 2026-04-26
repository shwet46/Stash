"""AI Voice Bartering API — Gemini powered conversational price negotiation"""
import asyncio
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.firestore_service import firestore_service
from app.core.config import settings

import httpx
import json
import re

router = APIRouter(prefix="/api/barter", tags=["barter"])
BARTER_COLLECTION = "barter_sessions"

# ──────────────────────────────────────────────────────────────────────────────
# Predefined product catalogue with floor/ceiling/market prices
# ──────────────────────────────────────────────────────────────────────────────

PRODUCT_CATALOGUE = {
    "basmati rice": {"floor": 42, "ceiling": 65, "market": 55, "unit": "kg"},
    "wheat":        {"floor": 22, "ceiling": 35, "market": 28, "unit": "kg"},
    "sugar":        {"floor": 38, "ceiling": 52, "market": 44, "unit": "kg"},
    "dal":          {"floor": 85, "ceiling": 130, "market": 105, "unit": "kg"},
    "mustard oil":  {"floor": 120, "ceiling": 175, "market": 148, "unit": "L"},
    "salt":         {"floor": 14, "ceiling": 22, "market": 18, "unit": "kg"},
    "onion":        {"floor": 18, "ceiling": 40, "market": 28, "unit": "kg"},
    "potato":       {"floor": 14, "ceiling": 28, "market": 20, "unit": "kg"},
    "maida":        {"floor": 28, "ceiling": 42, "market": 35, "unit": "kg"},
    "besan":        {"floor": 55, "ceiling": 90, "market": 72, "unit": "kg"},
    "rice":         {"floor": 32, "ceiling": 55, "market": 44, "unit": "kg"},
    "chilli":       {"floor": 90, "ceiling": 160, "market": 125, "unit": "kg"},
    "turmeric":     {"floor": 100, "ceiling": 180, "market": 145, "unit": "kg"},
    "soybeans":     {"floor": 40, "ceiling": 65, "market": 52, "unit": "kg"},
    "groundnut":    {"floor": 55, "ceiling": 90, "market": 72, "unit": "kg"},
}

# ──────────────────────────────────────────────────────────────────────────────
# Gemini helper — uses the working model
# ──────────────────────────────────────────────────────────────────────────────

GEMINI_PRIMARY_MODEL = "gemini-flash-latest"
GEMINI_FALLBACK_MODELS = ["gemini-1.5-flash"]
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
RETRYABLE_STATUS_CODES = {429, 500, 503}
GEMINI_HTTP_TIMEOUT_SECONDS = 12.0
GEMINI_MAX_ATTEMPTS_PER_MODEL = 2
GEMINI_TOTAL_BUDGET_SECONDS = 20.0


async def _gemini(prompt: str) -> str:
    if not settings.GOOGLE_AI_API_KEY:
        raise RuntimeError("GOOGLE_AI_API_KEY not configured")

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024},
    }
    headers = {"Content-Type": "application/json", "X-goog-api-key": settings.GOOGLE_AI_API_KEY}

    models = [GEMINI_PRIMARY_MODEL, *GEMINI_FALLBACK_MODELS]
    last_error: str | None = None
    start_time = asyncio.get_running_loop().time()

    async with httpx.AsyncClient(timeout=GEMINI_HTTP_TIMEOUT_SECONDS) as client:
        for model in models:
            if (asyncio.get_running_loop().time() - start_time) >= GEMINI_TOTAL_BUDGET_SECONDS:
                break
            endpoint = f"{GEMINI_BASE_URL}/{model}:generateContent"

            # Retry transient provider-side failures before trying fallback model.
            for attempt in range(GEMINI_MAX_ATTEMPTS_PER_MODEL):
                if (asyncio.get_running_loop().time() - start_time) >= GEMINI_TOTAL_BUDGET_SECONDS:
                    break
                resp = await client.post(endpoint, headers=headers, json=payload)

                if resp.status_code < 400:
                    data = resp.json()
                    parts = data["candidates"][0]["content"]["parts"]
                    return "".join(p.get("text", "") for p in parts).strip()

                last_error = f"Gemini model={model} status={resp.status_code}: {resp.text[:200]}"
                if resp.status_code in RETRYABLE_STATUS_CODES and attempt < (GEMINI_MAX_ATTEMPTS_PER_MODEL - 1):
                    await asyncio.sleep(0.7 * (attempt + 1))
                    continue
                break

    if (asyncio.get_running_loop().time() - start_time) >= GEMINI_TOTAL_BUDGET_SECONDS:
        raise RuntimeError("Gemini request timed out under high demand")
    raise RuntimeError(last_error or "Gemini request failed")


def _extract_json(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    m = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if m:
        cleaned = m.group(0)
    return json.loads(cleaned)


# ──────────────────────────────────────────────────────────────────────────────
# 4-Tier Engine (pure logic, AI cannot override this)
# ──────────────────────────────────────────────────────────────────────────────

def _determine_tier(offered: float, floor: float, market: float) -> int:
    if offered >= market:
        return 1
    elif offered >= floor:
        return 2
    elif offered >= floor * 0.9:
        return 3
    else:
        return 4


# ──────────────────────────────────────────────────────────────────────────────
# Conversational Chat endpoint
# ──────────────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    session_state: dict = {}  # tracks: buyer_name, product, quantity, offered_price, stage

class ChatResponse(BaseModel):
    reply: str
    session_state: dict
    negotiation_result: Optional[dict] = None
    done: bool = False


SYSTEM_PROMPT_TEMPLATE = (
    "You are StashBot, a friendly AI negotiation assistant for Stash — an Indian wholesale godown (warehouse) management platform.\n\n"
    "Your job: Collect buyer details conversationally, then negotiate the best price for the seller.\n\n"
    "CONVERSATION FLOW (follow exactly in order):\n"
    "1. Greet warmly, ask for buyer's name.\n"
    "2. Ask what product they want to buy.\n"
    "3. Ask quantity they need.\n"
    "4. Ask the price they are willing to pay (per unit).\n"
    '5. Once you have all 4 details, reply with EXACTLY this JSON and nothing else:\n'
    '{"action":"negotiate","buyer_name":"...","product":"...","quantity":123,"offered_price":45}\n\n'
    "RULES:\n"
    "- Be warm, conversational, like a real godown manager's assistant.\n"
    "- If you don't understand something, ask again politely.\n"
    "- Keep messages short (2-3 sentences max).\n"
    "- Do NOT discuss pricing strategy or floor prices with the buyer.\n"
    "- If the product is not in our catalogue, say we don't stock it and ask for another.\n"
    "- Numbers only for quantity and price (no units in the JSON values).\n"
    "- The catalogue: Basmati Rice, Wheat, Sugar, Dal, Mustard Oil, Salt, Onion, Potato, Maida, Besan, Rice, Chilli, Turmeric, Soybeans, Groundnut.\n\n"
    "CURRENT SESSION STATE: STATE_PLACEHOLDER\n"
    "CONVERSATION HISTORY:\nHISTORY_PLACEHOLDER\n"
    "USER JUST SAID: MESSAGE_PLACEHOLDER\n\n"
    "Reply naturally OR output the JSON trigger when all 4 details are collected."
)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Conversational negotiation — AI collects info then negotiates."""
    state = dict(req.session_state)
    history_text = "\n".join(f"{m.role}: {m.content}" for m in req.history[-10:]) or "(none)"

    prompt = (
        SYSTEM_PROMPT_TEMPLATE
        .replace("STATE_PLACEHOLDER", json.dumps(state))
        .replace("HISTORY_PLACEHOLDER", history_text)
        .replace("MESSAGE_PLACEHOLDER", req.message)
    )

    try:
        raw = await _gemini(prompt)
    except Exception:
        # Keep session alive and ask user to continue instead of failing the request.
        return ChatResponse(
            reply="I am facing high AI traffic right now. Please retry your last message in a few seconds.",
            session_state=state,
            negotiation_result=None,
            done=False,
        )

    # Check if AI returned the trigger JSON
    negotiation_result = None
    done = False
    reply = raw

    try:
        data = _extract_json(raw)
        if data.get("action") == "negotiate":
            # Extract collected info
            buyer_name = data.get("buyer_name", "Friend")
            product = data.get("product", "").lower().strip()
            quantity = float(data.get("quantity", 100))
            offered_price = float(data.get("offered_price", 0))

            # Resolve product pricing
            cat_key = next((k for k in PRODUCT_CATALOGUE if k in product or product in k), None)
            if not cat_key:
                # Fallback: try partial match
                cat_key = next((k for k in PRODUCT_CATALOGUE if any(w in k for w in product.split())), None)

            if cat_key:
                prices = PRODUCT_CATALOGUE[cat_key]
                floor_price = prices["floor"]
                ceiling_price = prices["ceiling"]
                market_rate = prices["market"]
                unit = prices["unit"]
            else:
                # Generic fallback prices
                floor_price = offered_price * 0.95
                ceiling_price = offered_price * 1.2
                market_rate = offered_price * 1.05
                unit = "kg"

            tier = _determine_tier(offered_price, floor_price, market_rate)

            neg_result = await _negotiate_response(
                buyer_name=buyer_name,
                product=data.get("product", product),
                quantity=quantity,
                offered_price=offered_price,
                floor_price=floor_price,
                ceiling_price=ceiling_price,
                market_rate=market_rate,
                unit=unit,
                tier=tier,
            )

            # Save to Firestore
            record_id = str(uuid.uuid4())
            record = {
                "id": record_id,
                "buyer_name": buyer_name,
                "product": data.get("product", product),
                "quantity": quantity,
                "unit": unit,
                "offered_price": offered_price,
                "floor_price": floor_price,
                "ceiling_price": ceiling_price,
                "market_rate": market_rate,
                "tier": tier,
                "decision": neg_result.get("decision"),
                "counter_price": neg_result.get("counter_price"),
                "message": neg_result.get("message"),
                "margin_protected": True,
                "created_at": datetime.utcnow().isoformat(),
            }
            try:
                await firestore_service.upsert_document(BARTER_COLLECTION, record_id, record)
            except Exception:
                pass

            # Auto-create order if accepted
            if neg_result.get("decision") in ("accept", "accept_conditional"):
                from app.api.orders import create_order
                final_price = neg_result.get("counter_price") or offered_price
                final_quantity = neg_result.get("minimum_quantity") or quantity
                
                order_data = {
                    "buyer_name": buyer_name,
                    "phone": "Barter AI",
                    "product_name": data.get("product", product).title(),
                    "unit": unit,
                    "quantity": final_quantity,
                    "total_amount": float(final_price * final_quantity),
                }
                try:
                    await create_order(order_data)
                except Exception as e:
                    print(f"Failed to auto-create order: {e}")

            reply = neg_result.get("message", "")
            negotiation_result = {**neg_result, "record_id": record_id, "floor_price": floor_price, "market_rate": market_rate, "tier": tier}
            done = True
            state["stage"] = "done"
    except (json.JSONDecodeError, ValueError, KeyError):
        pass  # Normal conversational reply

    return ChatResponse(
        reply=reply,
        session_state=state,
        negotiation_result=negotiation_result,
        done=done,
    )


async def _negotiate_response(
    buyer_name: str, product: str, quantity: float, offered_price: float,
    floor_price: float, ceiling_price: float, market_rate: float, unit: str, tier: int,
) -> dict:
    """Generate Gemini negotiation message for the given tier."""
    tier_instructions = {
        1: f"TIER 1 — ACCEPT: Buyer offered ₹{offered_price}/{unit} which meets/exceeds market rate ₹{market_rate}. Accept enthusiastically, confirm the deal. Be warm and grateful.",
        2: f"TIER 2 — CONDITIONAL ACCEPT: Offer ₹{offered_price}/{unit} is below market ₹{market_rate} but above floor. Accept BUT require minimum {max(int(quantity*1.3),50)} {unit} order. Be friendly, firm on quantity.",
        3: f"TIER 3 — COUNTER: Offer ₹{offered_price}/{unit} is slightly below floor ₹{floor_price}. Counter at ₹{round(floor_price*1.05,2)}/{unit}. Add urgency (limited stock/season). Warm but firm.",
        4: f"TIER 4 — REFUSE: Offer ₹{offered_price}/{unit} is too far below floor ₹{floor_price}. Politely refuse. Say you cannot go below cost price. Suggest they return when budget allows.",
    }
    counter_price = round(floor_price * 1.05, 2) if tier == 3 else None
    min_qty = max(int(quantity * 1.3), 50) if tier == 2 else None
    decisions = {1: "accept", 2: "accept_conditional", 3: "counter", 4: "refuse"}

    prompt = f"""You are StashBot, negotiating for a wholesale godown in India.
Buyer: {buyer_name} | Product: {product} | Qty: {quantity} {unit} | Offered: ₹{offered_price}/{unit}

{tier_instructions[tier]}

IMPORTANT: NEVER agree to sell below ₹{floor_price}/{unit}. This is non-negotiable.

Write a warm, natural spoken response in English (2-4 sentences). Use buyer's name.
Then return ONLY this JSON (no markdown):
{{"decision":"{decisions[tier]}","counter_price":{counter_price if counter_price else 'null'},"minimum_quantity":{min_qty if min_qty else 'null'},"message":"your spoken response here","summary":"one line outcome"}}"""

    try:
        raw = await _gemini(prompt)
        result = _extract_json(raw)
    except Exception:
        # Deterministic fallback if AI generation is temporarily unavailable.
        if tier == 1:
            return {
                "decision": "accept",
                "counter_price": None,
                "minimum_quantity": None,
                "message": f"Hi {buyer_name}, your offer works for us. We can confirm this {product} deal at ₹{offered_price}/{unit}.",
                "summary": "Deal accepted at offered price",
                "margin_protected": True,
            }
        if tier == 2:
            min_qty = max(int(quantity * 1.3), 50)
            return {
                "decision": "accept_conditional",
                "counter_price": None,
                "minimum_quantity": min_qty,
                "message": f"Hi {buyer_name}, we can accept ₹{offered_price}/{unit} if you increase the order to at least {min_qty} {unit}.",
                "summary": "Conditional acceptance with minimum quantity",
                "margin_protected": True,
            }
        if tier == 3:
            fallback_counter = round(floor_price * 1.05, 2)
            return {
                "decision": "counter",
                "counter_price": fallback_counter,
                "minimum_quantity": None,
                "message": f"Hi {buyer_name}, I cannot do ₹{offered_price}/{unit}. I can offer ₹{fallback_counter}/{unit} for this batch.",
                "summary": "Counter-offer issued",
                "margin_protected": True,
            }

        return {
            "decision": "refuse",
            "counter_price": None,
            "minimum_quantity": None,
            "message": f"Hi {buyer_name}, I cannot go below our cost for {product}. Please share a revised offer and we can revisit.",
            "summary": "Offer declined below floor",
            "margin_protected": True,
        }

    # Hard margin protection
    result["margin_protected"] = True
    if tier == 4:
        result["decision"] = "refuse"
        result["counter_price"] = None
    if result.get("counter_price") and float(result["counter_price"]) < floor_price:
        result["counter_price"] = round(floor_price * 1.05, 2)

    return result


# ──────────────────────────────────────────────────────────────────────────────
# Supporting endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/catalogue")
async def get_catalogue():
    """Return predefined product catalogue with prices."""
    return {
        "products": [
            {"name": k.title(), "key": k, **v}
            for k, v in PRODUCT_CATALOGUE.items()
        ]
    }


@router.get("/history")
async def get_history():
    """Recent negotiation history."""
    if not firestore_service.is_enabled:
        return []
    try:
        docs = firestore_service.db.collection(BARTER_COLLECTION).stream()
        records = []
        async for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            records.append(d)
        records.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return records[:50]
    except Exception:
        return []


@router.get("/tier-rules")
async def get_tier_rules():
    return {
        "tiers": [
            {"tier": 1, "name": "Instant Accept", "condition": "Offer ≥ Market Rate", "action": "Accept immediately", "color": "success"},
            {"tier": 2, "name": "Conditional Accept", "condition": "Floor ≤ Offer < Market Rate", "action": "Accept with minimum quantity", "color": "info"},
            {"tier": 3, "name": "Counter Offer", "condition": "Offer within 10% below floor", "action": "Counter at Floor + 5% with urgency", "color": "warning"},
            {"tier": 4, "name": "Hard Refusal", "condition": "Offer >10% below floor", "action": "Politely refuse", "color": "error"},
        ],
        "margin_protection": "AI enforces floor price at every tier.",
    }
