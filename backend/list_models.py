import asyncio
import httpx
import json
import os
from dotenv import load_dotenv

load_dotenv(".env")

API_KEY = os.getenv("GOOGLE_AI_API_KEY")

async def main():
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        data = resp.json()
        models = [m['name'] for m in data.get('models', []) if 'generateContent' in m.get('supportedGenerationMethods', [])]
        print(models)

if __name__ == "__main__":
    asyncio.run(main())
