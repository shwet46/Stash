import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv(".env")

API_KEY = os.getenv("GOOGLE_AI_API_KEY")

async def test_model(model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {"Content-Type": "application/json", "X-goog-api-key": API_KEY}
    payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, headers=headers, json=payload)
        print(f"Model {model}: Status {resp.status_code}")
        if resp.status_code != 200:
            print(resp.text[:200])

async def main():
    await test_model("gemini-2.0-flash")
    await test_model("gemini-2.5-flash")
    await test_model("gemini-flash-lite-latest")

if __name__ == "__main__":
    asyncio.run(main())
