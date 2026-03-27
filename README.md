# AI Supply Chain Router

Predictive supply chain routing using AI agents. See `architecture.md` for full system design.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- OpenAI API key (required for the Planner page)

## Setup & Run

### Backend

```bash
cd backend
npm install
cp .env.example .env   # add your OPENAI_API_KEY
npm run dev
```

Runs on **http://localhost:3001**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:5173**
