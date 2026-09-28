# IncidentMind

Persistent AI Incident Response Agent powered by Hindsight memory.

## Overview

Production incidents often repeat, but useful historical knowledge is buried in previous incidents, resolutions, and post-mortems. IncidentMind uses Hindsight as a persistent memory layer so the AI can recall relevant historical incidents and learn from resolved incidents.

## Why IncidentMind

While a normal LLM can provide generic incident advice, IncidentMind grounds its investigation in the team's previous incident experience, preventing recurring outages and saving valuable time.

## Key Features

- Incident intake
- AI-powered investigation
- Persistent Hindsight memory
- Historical incident recall
- Evidence categorization
- Resolution learning
- Future incident personalization
- Human-in-the-loop workflow

## How Hindsight Is Used

- **RETAIN**: Resolved incidents, root causes, actions, and useful post-mortem knowledge are stored in Hindsight.
- **RECALL**: When a new incident arrives, IncidentMind queries Hindsight for relevant historical experiences.
- **REASON**: Gemini receives the current incident plus relevant historical evidence and generates the investigation.
- **LEARN**: After resolution, the new experience is retained so future incidents can benefit from it.

Incident
↓
Hindsight Recall
↓
Historical Evidence
↓
Gemini Investigation
↓
Human Resolution
↓
Hindsight Retain
↓
Future Incident

## Architecture

React + TypeScript + Vite
↓
FastAPI Backend
↓
Hindsight Cloud + Gemini API

- **Frontend**: Handles incident intake, displays AI investigations, and captures human resolution.
- **Backend**: FastAPI orchestrates the incident workflow, managing memory operations and AI reasoning.
- **Hindsight Cloud**: Stores and retrieves relevant historical incident patterns.
- **Gemini API**: Analyzes incidents using real-time details and historical Hindsight context.

## Incident Investigation Flow

1. An incident is reported via the UI.
2. The backend sends a query to Hindsight to recall past similar incidents.
3. Relevant evidence is injected into the Gemini prompt along with the current incident.
4. Gemini generates an investigation report with root cause analysis and mitigation steps.

## Memory and Evidence

Evidence categories implemented:
- DIRECT MATCH
- RELATED TECHNICAL PATTERN
- ORGANIZATIONAL PATTERN
- IRRELEVANT

## Demo Scenarios

1. **payment-service — 503**: Payment API started returning 503 errors shortly after deployment v2.4.1. Database connection pool is exhausted and requests are timing out. Hindsight recalls relevant historical payment-service incidents and the AI investigation uses the historical evidence.
2. **order-service — 504**: Order requests are timing out intermittently. Database queries are taking more than 30 seconds and the order-service is reaching its request timeout limit. Hindsight recalls relevant historical database/query incidents.
3. **notification-service — 429**: Notification delivery has dropped sharply. The notification-service is receiving a sudden burst of requests and the external messaging provider is returning rate-limit responses. Hindsight recalls notification-service/429 historical incidents, including the retry/burst/rate-limit pattern.

## Learning Demonstration

A resolved incident is retained in Hindsight. When a similar incident occurs later, the new experience is recalled and influences the AI's investigation to prevent repeated mistakes.

## Tech Stack

- React
- TypeScript
- Vite
- FastAPI
- Python
- Hindsight Cloud
- hindsight-client
- Gemini API

## Project Structure

```
├── backend/
│   ├── app/
│   └── tests/
├── frontend/
│   ├── src/
│   └── public/
├── README.md
├── .env.example
└── .gitignore
```

## Setup

1. Clone the repository
2. Ensure you have a Python 3.11 environment
3. Install backend dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
5. Add Hindsight credentials to `.env`
6. Add Gemini credentials to `.env`
7. Start backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
8. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
9. Start frontend:
   ```bash
   npm run dev
   ```

## Environment Variables

- `HINDSIGHT_BASE_URL`
- `HINDSIGHT_API_KEY`
- `HINDSIGHT_BANK_ID`
- `GEMINI_API_KEY`

## Testing

Backend:
```bash
cd backend
pytest -q
```

Frontend:
```bash
cd frontend
npm run build
```

## Security

API credentials are supplied through environment variables and are excluded from version control.

## Limitations / Non-Goals

- No autonomous production infrastructure control.
- No automatic rollback.
- No direct Kubernetes control.
- No production deployment orchestration.
- Human remains responsible for final incident actions.

## Demo

[Demo Video](PASTE_DEMO_VIDEO_LINK_HERE)

## Screenshots

(Add screenshots here)

## Hackathon

IncidentMind was built for HackWithHyderabad 3.0 and uses Hindsight as its persistent memory layer.
