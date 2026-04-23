"""Twilio Voice service — inbound and outbound calls"""
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
from app.core.config import settings


def get_twilio_client() -> Client:
    """Get Twilio client instance"""
    return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)


def create_welcome_twiml() -> str:
    """Create TwiML for the initial welcome message"""
    response = VoiceResponse()
    gather = Gather(
        input="speech",
        action="/api/voice/process",
        method="POST",
        language="hi-IN",
        speech_timeout="auto",
        hints="stock, inventory, order, delivery, price, chana dal, rice, wheat, sugar",
    )
    gather.say(
        "Namaste! Stash mein aapka swagat hai. Aap kya karna chahenge? Stock update, order status, ya kuch aur?",
        voice="Polly.Aditi",
        language="hi-IN",
    )
    response.append(gather)

    # If no input, repeat
    response.say(
        "Koi input nahi mili. Kripya dobara try karein.",
        voice="Polly.Aditi",
        language="hi-IN",
    )
    response.redirect("/api/voice/welcome")

    return str(response)


def create_response_twiml(message: str, language: str = "hi") -> str:
    """Create TwiML response with spoken message"""
    response = VoiceResponse()

    if language == "hi":
        response.say(message, voice="Polly.Aditi", language="hi-IN")
    else:
        response.say(message, voice="Polly.Raveena", language="en-IN")

    # Offer to continue
    gather = Gather(
        input="speech",
        action="/api/voice/process",
        method="POST",
        language="hi-IN" if language == "hi" else "en-IN",
        speech_timeout="auto",
    )
    gather.say(
        "Kya aap kuch aur karna chahenge?" if language == "hi" else "Would you like to do anything else?",
        voice="Polly.Aditi" if language == "hi" else "Polly.Raveena",
        language="hi-IN" if language == "hi" else "en-IN",
    )
    response.append(gather)

    response.say(
        "Dhanyavaad! Stash use karne ke liye shukriya." if language == "hi" else "Thank you for using Stash!",
        voice="Polly.Aditi" if language == "hi" else "Polly.Raveena",
        language="hi-IN" if language == "hi" else "en-IN",
    )
    response.hangup()

    return str(response)


async def make_outbound_call(to_number: str, twiml_url: str) -> str:
    """Place an outbound call (e.g. to supplier for reorder)"""
    client = get_twilio_client()
    call = client.calls.create(
        to=to_number,
        from_=settings.TWILIO_PHONE_NUMBER,
        url=twiml_url,
    )
    return call.sid
