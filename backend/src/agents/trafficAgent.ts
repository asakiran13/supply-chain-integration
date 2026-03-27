import { AgentReport, Disruption, ShippingRoute } from '../types/index.js';

export async function trafficAgent(
  disruptions: Disruption[],
  routes: ShippingRoute[]
): Promise<AgentReport> {
  const trafficEvents = disruptions.filter(
    (d) => d.type === 'traffic' || d.type === 'infrastructure'
  );

  if (trafficEvents.length === 0) {
    return {
      agent: 'trafficAgent',
      risk_score: 0,
      affected_route_ids: [],
      summary: 'No active traffic or infrastructure disruptions detected.',
      delay_days: 0,
    };
  }

  const affectedRouteIds = new Set<string>();
  trafficEvents.forEach((e) => e.affected_route_ids.forEach((r) => affectedRouteIds.add(r)));

  const severityScore: Record<string, number> = { low: 15, medium: 40, high: 65, critical: 90 };
  const maxSeverity = trafficEvents.reduce((max, e) => {
    return severityScore[e.severity] > severityScore[max] ? e.severity : max;
  }, 'low' as string);

  const riskScore = Math.min(100, severityScore[maxSeverity] + (trafficEvents.length - 1) * 5);
  const affectedNames = [...affectedRouteIds]
    .map((id) => routes.find((r) => r.id === id)?.name ?? id)
    .join(', ');

  const delayMap: Record<string, number> = { low: 1, medium: 2, high: 5, critical: 10 };

  return {
    agent: 'trafficAgent',
    risk_score: riskScore,
    affected_route_ids: [...affectedRouteIds],
    summary: `${trafficEvents.length} traffic/infrastructure event(s) (max severity: ${maxSeverity}). Congestion or blockage on: ${affectedNames || 'none'}.`,
    delay_days: delayMap[maxSeverity] ?? 0,
  };
}
