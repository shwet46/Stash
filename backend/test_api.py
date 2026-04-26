import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        # Create a tiny dummy wav/webm file content
        files = {'audio': ('recording.webm', b'dummy_audio_bytes', 'audio/webm')}
        resp = await client.post('http://localhost:8000/api/voice/web', files=files)
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text}")

asyncio.run(main())
