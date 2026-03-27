import { AgentReport, Disruption, ShippingRoute } from '../types/index.js';

export async function newsAgent(
  disruptions: Disruption[],
  routes: ShippingRoute[]
): Promise<AgentReport> {
  const geoEvents = disruptions.filter((d) => d.type === 'geopolitical');

  if (geoEvents.length === 0) {
    return {
      agent: 'newsAgent',
      risk_score: 0,
      affected_route_ids: [],
      summary: 'No active geopolitical disruptions detected.',
      delay_days: 0,
    };
  }

  const affectedRouteIds = new Set<string>();
  geoEvents.forEach((e) => e.affected_route_ids.forEach((r) => affectedRouteIds.add(r)));

  const severityScore: Record<string, number> = { low: 25, medium: 50, high: 80, critical: 100 };
  const maxSeverity = geoEvents.reduce((max, e) => {
    return severityScore[e.severity] > severityScore[max] ? e.severity : max;
  }, 'low' as string);

  const riskScore = Math.min(100, severityScore[maxSeverity] + (geoEvents.length - 1) * 5);
  const affectedNames = [...affectedRouteIds]
    .map((id) => routes.find((r) => r.id === id)?.name ?? id)
    .join(', ');

  const delayMap: Record<string, number> = { low: 2, medium: 5, high: 10, critical: 21 };

  return {
    agent: 'newsAgent',
    risk_score: riskScore,
    affected_route_ids: [...affectedRouteIds],
    summary: `${geoEvents.length} geopolitical event(s) detected (max severity: ${maxSeverity}). Affected routes: ${affectedNames || 'none'}. Elevated risk of route closure or piracy.`,
    delay_days: delayMap[maxSeverity] ?? 0,
  };
}
