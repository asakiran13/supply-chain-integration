# Predictive Supply Chain Routing — MVP Plan

> Last updated: 2026-03-27
> Status: Implementation in progress

## Overview

An AI-driven supply chain routing platform that monitors shipping routes, detects disruptions, and recommends optimal routes using multi-agent AI orchestration.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Frontend | React + Vite + TypeScript |
| Maps | react-map-gl (OpenStreetMap free tiles) |
| AI / LLM | OpenAI GPT-4o (tool calling) |
| Storage | In-memory (no DB for MVP) |

## Routes in Scope (MVP)

| Route | Connects | Alternative For |
|---|---|---|
| Suez Canal | Europe ↔ Asia | → Cape of Good Hope |
| Cape of Good Hope | Europe ↔ Asia (longer) | Suez backup |
| Panama Canal | Atlantic ↔ Pacific | — |
| Strait of Hormuz | Persian Gulf ↔ Indian Ocean | — |

## Pages

| Page | Path | Purpose |
|---|---|---|
| Dashboard | `/dashboard` | World map with live route status + disruption overlays |
| Simulate | `/simulate` | Inject test disruptions (weather / geopolitical / traffic) |
| Planner | `/planner` | Origin → Destination → AI-recommended safest route + cost |

## Implementation Phases

### Phase 1 — Scaffolding ✅
- Init `backend/` with express, typescript, openai, cors, dotenv, tsx
- Init `frontend/` with vite react-ts template
- Install react-map-gl, react-router-dom, axios on frontend

### Phase 2 — Route Data Store ✅
- `backend/src/data/routes.ts` — 4 routes with lat/lng waypoints, base cost/TEU, transit days
- In-memory disruptions array
- Route-affinity map (which disruptions affect which routes)
- Shared TypeScript types: `ShippingRoute`, `Disruption`, `AgentReport`, `RouteRecommendation`

### Phase 3 — AI Agents ✅
- `weatherAgent.ts` — weather event → risk score + affected route IDs
- `newsAgent.ts` — geopolitical event → risk level + impacted corridors
- `trafficAgent.ts` — congestion/blockage → delay estimate + affected route IDs
- `orchestratorAgent.ts` — GPT-4o tool calling hub → synthesizes all agents → returns recommendation + cost

### Phase 4 — REST API ✅
- `GET /api/routes` — all routes with current disruption status
- `GET /api/disruptions` — active disruptions
- `POST /api/disruptions` — inject a disruption
- `DELETE /api/disruptions/:id` — remove a disruption
- `POST /api/plan` — `{ origin, destination }` → route recommendation + cost

### Phase 5 — Frontend Pages ✅
- **Dashboard**: map polylines colored by severity, disruption markers with tooltips, sidebar list
- **Simulate**: form (type, route, severity, description) + active disruptions table with delete
- **Planner**: port dropdowns, "Find Safest Route" button, result card with map highlight + AI reasoning

### Phase 6 — Polish ✅
- Shared navbar
- Color-coded severity badges (low / medium / high / critical)
- Loading states for AI calls

## Cost Model

```
trip_cost = base_cost_per_teu × distance_multiplier × (1 + disruption_surcharge)
```

Stored statically per route. No external pricing API.

## Running the Project

```bash
# Backend (port 3001)
cd backend
cp .env.example .env   # add your OPENAI_API_KEY
npm install
npm run dev

# Frontend (port 5173)
cd frontend
npm install
npm run dev
```

## Verification Checklist

- [ ] `/dashboard` loads with 4 routes visible on world map
- [ ] Inject Suez disruption → polyline turns red, marker appears
- [ ] `/planner`: Shanghai → Rotterdam with Suez disrupted → Cape of Good Hope recommended with cost delta
- [ ] Delete disruption → route returns to green
