import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv(".env")
API_KEY = os.getenv("GOOGLE_AI_API_KEY")

async def test_model(model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {"Content-Type": "application/json", "X-goog-api-key": API_KEY}
    payload = {"contents": [{"parts": [{"text": "Hello, how are you?"}]}]}
    
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(url, headers=headers, json=payload, timeout=5.0)
            print(f"Model {model}: Status {resp.status_code}")
            if resp.status_code == 200:
                print(f"SUCCESS with {model}")
        except Exception as e:
            print(f"Model {model}: Exception {e}")

async def main():
    models = [
        "gemma-3-1b-it",
        "gemma-3-4b-it",
        "gemini-2.0-flash-001"
    ]
    await asyncio.gather(*(test_model(m) for m in models))

if __name__ == "__main__":
    asyncio.run(main())
