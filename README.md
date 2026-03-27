# AI Supply Chain Router

An intelligent, AI-driven platform that monitors global shipping routes, detects disruptions in real time, and recommends the safest and most cost-effective route between any two ports — powered by GPT-4o multi-agent orchestration.

---

## Features

- **Dashboard** — Interactive world map showing 4 major shipping routes. Routes turn amber/red when disruptions are active.
- **Simulate** — Inject test disruptions (war, weather, port congestion, etc.) with one-click presets or a custom form.
- **Planner** — Select an origin and destination port; the AI recommends the safest route with estimated cost and transit time, and explains its reasoning.

### Shipping Routes Covered
| Route | Connects |
|---|---|
| Suez Canal | Europe ↔ Asia |
| Cape of Good Hope | Europe ↔ Asia (Suez alternative) |
| Panama Canal | Atlantic ↔ Pacific |
| Strait of Hormuz | Persian Gulf ↔ Indian Ocean |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | React + Vite + TypeScript |
| Maps | react-map-gl + maplibre-gl (free, no API key) |
| AI / LLM | OpenAI GPT-4o (tool calling) |
| Storage | In-memory (no database required) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- An [OpenAI API key](https://platform.openai.com/api-keys) (only needed for the Planner page)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/asakiran13/supply-chain-integration.git
cd supply-chain-integration
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and add your OpenAI key:

```
OPENAI_API_KEY=sk-...your-key-here...
PORT=3001
```

Start the backend:

```bash
npm run dev
```

Backend runs on **http://localhost:3001**

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Usage

### Dashboard (`/dashboard`)
- Opens automatically on launch
- Shows all 4 shipping routes as colored polylines on a world map
- **Green** = no disruptions · **Amber** = medium risk · **Red** = high/critical
- Sidebar lists all active disruptions and affected routes
- Auto-refreshes every 10 seconds

### Simulate (`/simulate`)
- Use **Quick Scenarios** to inject a preset disruption with one click:
  - War blocking Suez Canal
  - Hurricane at Panama Canal
  - Hormuz tanker seizure
  - Cape Town port congestion
- Or fill in the custom form to create any disruption
- Active disruptions are listed in a table with a delete button
- After injecting, you are redirected to the Dashboard to see the effect

### Planner (`/planner`)
- Select an **origin** and **destination** from the port dropdown (12 major ports)
- Click **Find Safest Route**
- The AI runs 3 specialist agents (weather, news, traffic) in parallel, then GPT-4o synthesizes a recommendation showing:
  - Recommended route (highlighted in blue on the map)
  - Estimated cost (USD per TEU)
  - Estimated transit time (days)
  - Risk level
  - AI reasoning summary
  - Alternative routes

> **Note:** The Planner requires a valid `OPENAI_API_KEY`. The Dashboard and Simulate pages work without it.

---

## Project Structure

```
supply-chain-integration/
├── backend/
│   ├── src/
│   │   ├── agents/          # weatherAgent, newsAgent, trafficAgent, orchestratorAgent
│   │   ├── data/            # Static route definitions (waypoints, cost, transit days)
│   │   ├── routes/          # Express API route handlers
│   │   ├── store/           # In-memory disruptions store
│   │   ├── types/           # Shared TypeScript types
│   │   └── index.ts         # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── components/      # Navbar, MapView, SeverityBadge
│   │   ├── pages/           # Dashboard, Simulate, Planner
│   │   ├── types/           # Shared TypeScript types
│   │   └── App.tsx
│   └── package.json
├── plan.md                  # Implementation plan
├── architecture.md          # System architecture and design decisions
└── README.md
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/routes` | All routes with current disruption status |
| GET | `/api/disruptions` | Active disruptions |
| POST | `/api/disruptions` | Inject a new disruption |
| DELETE | `/api/disruptions/:id` | Remove a disruption |
| POST | `/api/plan` | `{ origin, destination }` → route recommendation |
| GET | `/api/health` | Health check |

---

## Adding More Routes

Edit `backend/src/data/routes.ts` to add new shipping routes. Each route needs:
- `id` — unique slug
- `waypoints` — array of `[lng, lat]` coordinates
- `base_cost_per_teu` — USD cost
- `transit_days` — base transit time
- `corridor` — region tags used for route matching
- `alternatives` — IDs of substitute routes

---

## License

MIT
