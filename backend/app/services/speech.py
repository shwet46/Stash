"""Google Cloud Speech-to-Text v2 service"""
from google.cloud import speech_v2
from app.core.config import settings


async def transcribe_audio(audio_content: bytes, language_code: str = "hi-IN") -> str:
    """Transcribe audio bytes using Google Cloud Speech-to-Text v2"""
    client = speech_v2.SpeechAsyncClient()

    config = speech_v2.RecognitionConfig(
        auto_decoding_config=speech_v2.AutoDetectDecodingConfig(),
        language_codes=[language_code, "en-IN"],
        model="latest_long",
        features=speech_v2.RecognitionFeatures(
            enable_automatic_punctuation=True,
            enable_word_time_offsets=True,
        ),
    )

    request = speech_v2.RecognizeRequest(
        recognizer=f"projects/{settings.GOOGLE_CLOUD_PROJECT}/locations/global/recognizers/_",
        config=config,
        content=audio_content,
    )

    response = await client.recognize(request=request)

    transcript = ""
    for result in response.results:
        transcript += result.alternatives[0].transcript

    return transcript


async def transcribe_phone_audio(audio_url: str, language_code: str = "hi-IN") -> str:
    """Transcribe audio from a Twilio recording URL"""
    import httpx

    async with httpx.AsyncClient() as client:
        response = await client.get(audio_url)
        audio_content = response.content

    return await transcribe_audio(audio_content, language_code)
