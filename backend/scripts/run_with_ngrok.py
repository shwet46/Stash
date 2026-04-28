"""Start the Stash backend with an ngrok tunnel and auto-set the Telegram webhook.

Usage:
  python scripts/run_with_ngrok.py

Requirements:
  pip install pyngrok requests python-dotenv

Notes:
  - Ensure your virtualenv is activated and `TELEGRAM_BOT_TOKEN` is set in .env or environment.
  - This script will start an ngrok tunnel for port 8000 and then launch uvicorn.
"""
import os
import subprocess
import sys
import time
from urllib.parse import urljoin

try:
    from pyngrok import ngrok
except Exception:
    ngrok = None

import requests
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
PORT = int(os.getenv("PORT", 8000))

if not TELEGRAM_TOKEN:
    print("Missing TELEGRAM_BOT_TOKEN environment variable. Set it in .env or export it.")
    sys.exit(1)

public_url = None
if ngrok:
    try:
        print(f"Starting ngrok tunnel on port {PORT}...")
        tunnel = ngrok.connect(PORT)
        public_url = tunnel.public_url
        print("Ngrok public URL:", public_url)
    except Exception as e:
        print("Failed to start ngrok via pyngrok:", e)
        public_url = None

if not public_url:
    print("Could not start ngrok programmatically. Please run `ngrok http 8000` in another terminal and set TELEGRAM_WEBHOOK_URL to the HTTPS URL it gives.")
    sys.exit(1)

webhook_path = "/api/webhook/telegram"
webhook_url = urljoin(public_url, webhook_path.lstrip("/"))
print("Setting Telegram webhook to:", webhook_url)

res = requests.post(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/setWebhook", data={"url": webhook_url})
try:
    print("Telegram setWebhook response:", res.status_code, res.json())
except Exception:
    print("Telegram setWebhook response status:", res.status_code, res.text)

# Wait a little for the tunnel to settle
time.sleep(1)

# Launch uvicorn
print("Starting uvicorn: app.main:app on 0.0.0.0:8000")
cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", str(PORT)]

# Inherit current environment so TELEGRAM_BOT_TOKEN is visible to the app
os.execvpe(sys.executable, cmd, os.environ)
