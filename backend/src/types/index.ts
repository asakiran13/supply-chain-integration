export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type DisruptionType = 'weather' | 'geopolitical' | 'traffic' | 'infrastructure';

export interface ShippingRoute {
  id: string;
  name: string;
  waypoints: [number, number][]; // [lng, lat]
  base_cost_per_teu: number;     // USD
  transit_days: number;
  corridor: string[];
  alternatives: string[];
  center: [number, number];      // [lng, lat] for map label
  description: string;
}

export interface Disruption {
  id: string;
  type: DisruptionType;
  affected_route_ids: string[];
  severity: Severity;
  description: string;
  location?: [number, number];   // [lng, lat]
  created_at: string;
}

export interface AgentReport {
  agent: string;
  risk_score: number;            // 0–100
  affected_route_ids: string[];
  summary: string;
  delay_days?: number;
}

export interface RouteWithStatus extends ShippingRoute {
  disruptions: Disruption[];
  max_severity: Severity | 'none';
}

export interface RouteRecommendation {
  recommended_route: ShippingRoute;
  alternative_routes: ShippingRoute[];
  estimated_cost_usd: number;
  estimated_transit_days: number;
  risk_level: Severity | 'none';
  reasoning: string;
  disruptions_considered: Disruption[];
  agent_reports: AgentReport[];
}
