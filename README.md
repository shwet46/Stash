# Stash — Voice-Native AI Supply Chain Platform

Stash is a voice-native AI supply chain management platform designed for India's godown (warehouse) operators. It allows users to manage inventory, orders, and suppliers using voice commands in Hindi, English, and Hinglish.

---

## 🚀 Quick Start (Docker)

The easiest way to run the entire stack is using Docker Compose.

1.  **Clone the repository** (you are already here).
2.  **Configure environment variables**:
    ```bash
    cp .env.example .env
    ```
    *Open `.env` and fill in your API keys (Google AI, Twilio, Telegram).*
3.  **Start the services**:
    ```bash
    docker-compose up --build
    ```
4.  **Access the applications**:
    - **Frontend**: [http://localhost:3000](http://localhost:3000)
    - **Backend API**: [http://localhost:8000](http://localhost:8000)
    - **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Manual Setup

If you prefer to run services manually for development:

### 1. Prerequisites
- **Python 3.12+** (with `uv` installed: `pip install uv`)
- **Node.js 20+**
- **PostgreSQL 16** with PostGIS extension
- **Redis 7**

### 2. Backend Setup
```bash
cd backend
uv sync
# Ensure your local Postgres/Redis match the .env settings
uv run uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 💾 Database Seeding

To populate the database with realistic Indian godown data:

```bash
# Using Docker
docker-compose exec backend uv run python app/db/seed_run.py

# Manual
cd backend
uv run python app/db/seed_run.py
```

This seed script writes records to PostgreSQL and mirrors the same datasets to Firestore collections.

For Firestore visibility, set these in `.env`:

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
FIRESTORE_DATABASE=stash
```

If credentials are missing, seeding still succeeds for PostgreSQL and logs a Firestore skip warning.

---

## 📞 Testing Voice Features

Since voice features rely on Twilio webhooks, you'll need a tunnel (like `ngrok`) to expose your local backend to the internet.

1.  Start ngrok: `ngrok http 8000`
2.  Update your Twilio console webhook URL for your number to: `https://your-ngrok-url.ngrok-free.app/api/voice/welcome`
3.  Call your Twilio number and start talking!

---

## 📱 Testing Telegram Bot

1.  Set your Telegram Bot Token in `.env`.
2.  The backend will automatically register the webhook if `BACKEND_URL` is set to your ngrok URL.
3.  Message your bot on Telegram.
