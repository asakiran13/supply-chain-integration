# Architecture — Predictive Supply Chain Routing

> Last updated: 2026-03-27

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)              │
│                                                             │
│  /dashboard          /simulate           /planner           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │ MapView      │   │ DisruptionForm│   │ PortSelector │   │
│  │ RouteLayer   │   │ ActiveEvents  │   │ RouteResult  │   │
│  │ DisruptionMkr│   └──────────────┘   │ MapHighlight │   │
│  │ Sidebar      │                       └──────────────┘   │
│  └──────────────┘                                          │
│           │                    │                   │        │
└───────────┼────────────────────┼───────────────────┼───────┘
            │         REST API (HTTP/JSON)            │
┌───────────┼────────────────────┼───────────────────┼───────┐
│                        BACKEND (Node + Express)             │
│                                                             │
│  Routes: /api/routes  /api/disruptions  /api/plan           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Orchestrator Agent                  │   │
│  │        (GPT-4o tool calling — synthesizes all)       │   │
│  │  ┌──────────────┐ ┌─────────────┐ ┌─────────────┐  │   │
│  │  │ weatherAgent │ │  newsAgent  │ │trafficAgent │  │   │
│  │  └──────────────┘ └─────────────┘ └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   In-Memory Store                    │   │
│  │   routes[] (static)    disruptions[] (mutable)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
ai-supplychain/
├── plan.md
├── architecture.md
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── weatherAgent.ts      ← weather risk assessment
│   │   │   ├── newsAgent.ts         ← geopolitical risk assessment
│   │   │   ├── trafficAgent.ts      ← congestion/blockage assessment
│   │   │   └── orchestratorAgent.ts ← GPT-4o tool-calling hub
│   │   ├── routes/
│   │   │   ├── routes.ts            ← GET /api/routes
│   │   │   ├── disruptions.ts       ← GET/POST/DELETE /api/disruptions
│   │   │   └── plan.ts              ← POST /api/plan
│   │   ├── data/
│   │   │   └── routes.ts            ← static route definitions (waypoints, cost, days)
│   │   ├── store/
│   │   │   └── disruptions.ts       ← in-memory disruptions store
│   │   ├── types/
│   │   │   └── index.ts             ← ShippingRoute, Disruption, AgentReport, RouteRecommendation
│   │   └── index.ts                 ← Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        ← world map + disruption overlays
│   │   │   ├── Simulate.tsx         ← disruption injection form
│   │   │   └── Planner.tsx          ← origin/destination route finder
│   │   ├── components/
│   │   │   ├── Navbar.tsx           ← shared navigation
│   │   │   ├── MapView.tsx          ← react-map-gl base map
│   │   │   ├── RouteLayer.tsx       ← route polylines colored by severity
│   │   │   ├── DisruptionMarker.tsx ← map pins for active disruptions
│   │   │   └── Sidebar.tsx          ← disruption list panel
│   │   ├── api/
│   │   │   └── client.ts            ← axios API calls
│   │   ├── types/
│   │   │   └── index.ts             ← shared TS types (mirrors backend)
│   │   ├── App.tsx                  ← router setup
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
```

## Key Data Types

```typescript
// ShippingRoute — stored statically
interface ShippingRoute {
  id: string;                    // e.g. "suez-canal"
  name: string;
  waypoints: [number, number][]; // [lng, lat] pairs for map rendering
  base_cost_per_teu: number;     // USD
  transit_days: number;
  corridor: string[];            // e.g. ["europe", "asia"]
  alternatives: string[];        // route IDs that can substitute
  center: [number, number];      // map marker center [lng, lat]
}

// Disruption — stored in-memory, injected via /simulate
interface Disruption {
  id: string;
  type: "weather" | "geopolitical" | "traffic" | "infrastructure";
  affected_route_ids: string[];
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  location?: [number, number];   // [lng, lat] for map marker
  created_at: string;
}

// AgentReport — output of each specialist agent
interface AgentReport {
  agent: string;
  risk_score: number;            // 0-100
  affected_route_ids: string[];
  summary: string;
  delay_days?: number;
}

// RouteRecommendation — returned by /api/plan
interface RouteRecommendation {
  recommended_route: ShippingRoute;
  alternative_routes: ShippingRoute[];
  estimated_cost_usd: number;
  estimated_transit_days: number;
  risk_level: "low" | "medium" | "high" | "critical";
  reasoning: string;             // GPT-4o explanation
  disruptions_considered: Disruption[];
}
```

## Agent Architecture

Each agent is a typed async function:

```
weatherAgent(disruptions: Disruption[], routes: ShippingRoute[])  → AgentReport
newsAgent(disruptions: Disruption[], routes: ShippingRoute[])     → AgentReport
trafficAgent(disruptions: Disruption[], routes: ShippingRoute[])  → AgentReport

orchestratorAgent(
  origin: string,
  destination: string,
  disruptions: Disruption[],
  routes: ShippingRoute[]
) → RouteRecommendation
```

The orchestrator uses GPT-4o tool calling to invoke each specialist agent, then synthesizes a final recommendation.

## Cost Formula

```
trip_cost = base_cost_per_teu × (1 + disruption_surcharge)
```

| Severity | Surcharge |
|---|---|
| none | 0% |
| low | 5% |
| medium | 15% |
| high | 30% |
| critical | 50% |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/routes | All routes + current disruption flags |
| GET | /api/disruptions | Active disruptions |
| POST | /api/disruptions | Inject a new disruption |
| DELETE | /api/disruptions/:id | Remove a disruption |
| POST | /api/plan | `{ origin, destination }` → RouteRecommendation |

## Map Rendering

- Library: `react-map-gl` v7 with `maplibre-gl` (fully free, no API key)
- Basemap: OpenStreetMap via Stadia free tiles or carto-db free style
- Routes: GeoJSON `LineString` rendered as `<Layer>` with `line` type
- Colors: `#22c55e` green (clear) → `#f59e0b` amber (low/medium) → `#ef4444` red (high/critical)
- Disruption markers: SVG circle pins with tooltip on hover
- Planner highlight: recommended route in `#3b82f6` blue, 4px stroke
