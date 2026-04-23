# 📦 Stash — Voice-Native AI Supply Chain Platform

Stash is a next-generation supply chain management platform specifically engineered for India's warehouse (godown) operators. By leveraging **Voice-Native AI**, Stash enables operators to manage inventory, streamline orders, and negotiate with suppliers using natural language commands in **Hindi, English, and Hinglish**.

---

## 🏗️ Architecture Overview

- **Frontend**: Next.js 15 (App Router) with custom CSS and Framer Motion for a premium, responsive UI.
- **Backend**: Python 3.12 (FastAPI) utilizing `uv` for lightning-fast dependency management.
- **Database**: PostgreSQL (with PostGIS) for relational data and Firestore for real-time mirrors.
- **AI Engine**: Google Gemini 1.5 Flash for NLU (Natural Language Understanding) and intent extraction.
- **Voice Stack**: Google Speech-to-Text v2, Text-to-Speech, and Twilio for cellular integration.

---

## 🚀 Getting Started

### 1. Clone & Configure
```bash
git clone https://github.com/shwet46/Stash.git
cd Stash
cp .env.example .env
```
> [!IMPORTANT]
> Open `.env` and fill in your API keys for Google AI, Twilio, and Telegram to enable full functionality.

### 2. Run via Docker (Recommended)
The easiest way to orchestrate all services including Postgres, Redis, and the AI backend.
```bash
docker-compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Manual Development Setup

If you prefer to run services natively for faster iteration:

### Prerequisites
- **Python 3.12+** (Install `uv`: `pip install uv`)
- **Node.js 20+** (Install `pnpm` or `npm`)
- **PostgreSQL 16** & **Redis 7**

### Backend Setup
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 💾 Database & Seeding

To populate the system with realistic data (Suppliers, Inventory, Warehouse locations):

**Via Docker:**
```bash
docker-compose exec backend uv run python app/db/seed_run.py
```

**Manual:**
```bash
cd backend
uv run python app/db/seed_run.py
```
*Note: This script seeds PostgreSQL and attempts to mirror data to Firestore if credentials are provided.*

---

## 🎙️ Testing Voice & Telegram

### Voice Commands
Voice features require a public endpoint for Twilio webhooks.
1. Start ngrok: `ngrok http 8000`
2. Set `BACKEND_URL` in `.env` to your ngrok URL.
3. Configure Twilio: Point your number's Voice Webhook to `https://<your-url>/api/voice/welcome`.

### Telegram Bot
1. Provide `TELEGRAM_BOT_TOKEN` in `.env`.
2. The backend registers the webhook automatically on startup if `BACKEND_URL` is set.

---

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.
