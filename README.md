![Stash Banner](assets/readme1.png)


![Stash Analytics](assets/readme2.png)

---

**STASH** is a high-performance, voice-native AI supply chain platform designed to modernize warehouse operations. By bridging the gap between physical inventory and digital intelligence, Stash empowers godown operators with multilingual voice control, predictive analytics, and automated logistics.

---

![Stash Dashboard](assets/readme3.png)

---

## Bridging the Gap: From Chaos to Clarity

| The Challenge | The Stash Solution |
| :--- | :--- |
| **Manual Error Loops** <br> Traditional stock tracking is slow and error-prone. | **Voice-Native Accuracy** <br> Update inventory hands-free with real-time AI verification. |
| **Reactive Procurement** <br> Reordering happens too late, leading to lost sales. | **Predictive Intelligence** <br> AI forecasts demand and automates reordering before you run out. |
| **Communication Overhead** <br> Constant back-and-forth with suppliers wastes hours. | **Autonomous Coordination** <br> AI handles supplier outreach and coordination via voice & text. |
| **Cash Flow Friction** <br> Delayed billing and poor tracking hurt the bottom line. | **Financial Automation** <br> Automated GST billing, credit tracking, and instant reminders. |

---

## Features

| Feature | Description |
| --- | --- |
| **Voice-First Operations** | **Multilingual Control:** Manage inventory, orders, and tasks using simple voice commands in English, Hindi, etc. <br>**Hands-Free Workflow:** Designed for warehouse floor efficiency where typing is a hurdle. |
| **Smart Inventory AI** | **Real-Time Tracking:** Instant stock updates with discrepancy alerts.<br>**Stock Intelligence:** AI-driven demand prediction and reordering logic to prevent stockouts. |
| **Automated Supply Chain** | **Supplier Automation:** Auto-place orders with primary and backup suppliers based on stock levels.<br>**AI Negotiation:** Handle price negotiations within margin rules with user oversight. |
| **Order & Logistics** | **Voice-Based Ordering:** Enable buyers to place and track orders via voice.<br>**Delivery Tracking:** Real-time monitoring with automated follow-ups and status updates. |
| **Financial Intelligence** | **Billing & Payments:** Generate GST-compliant invoices and automate payment reminders.<br>**Credit Tracking:** Keep tabs on supplier and buyer credit effortlessly. |
| **Warehouse Synergy** | **Multi-Warehouse Management:** Manage multiple godowns under one account with consolidated visibility and inter-warehouse transfers.<br>**Unified Intelligence:** A central AI layer that learns and improves warehouse operations continuously. |

---

![Stash Mobile](assets/readme5.jpeg)

---

![Stash Mobile](assets/readme4.png)

---

## Sustainable Development Goals (SDGs)

This product is committed to and supports the following **Sustainable Development Goals**:
*   **SDG 8:** Decent Work and Economic Growth
*   **SDG 9:** Industry, Innovation, and Infrastructure
*   **SDG 12:** Responsible Consumption and Production
*   **SDG 13:** Climate Action

---

## Setup Instructions

#### 1. Clone the repository
```bash
git clone https://github.com/shwet46/Stash.git
cd Stash
cp .env.example .env
```

#### 2. Set up the AI Backend
Navigate to the `backend` directory and install dependencies using `uv`.
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```
*Note: Make sure you have Python 3.12+ and `uv` installed.*

Telegram replies require `TELEGRAM_BOT_TOKEN` and a public `TELEGRAM_WEBHOOK_URL` or `BACKEND_URL` that Telegram can reach. For local development, `http://localhost:8000` is not enough because Telegram cannot call back into your machine.
Telegram registration alerts require `TELEGRAM_BOT_TOKEN` to be set in your environment. The chat ID must belong to a chat that has already started the bot.

#### 3. Set up the Frontend
Navigate to the `frontend` directory and install the Node dependencies.
```bash
cd ../frontend
npm install
npm run dev
```
*Note: Make sure you have Node.js 20+ installed.*

#### 4. Docker Deployment (Optional)
Run the entire stack (including Redis and Firestore emulators) with a single command:
```bash
docker-compose up --build
```
---

## License

This project is licensed under the Apache-2.0 license. See the [LICENSE](LICENSE) file for details.

---
