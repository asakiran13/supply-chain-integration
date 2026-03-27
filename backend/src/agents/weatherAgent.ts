import { AgentReport, Disruption, ShippingRoute } from '../types/index.js';

export async function weatherAgent(
  disruptions: Disruption[],
  routes: ShippingRoute[]
): Promise<AgentReport> {
  const weatherEvents = disruptions.filter((d) => d.type === 'weather');

  if (weatherEvents.length === 0) {
    return {
      agent: 'weatherAgent',
      risk_score: 0,
      affected_route_ids: [],
      summary: 'No active weather disruptions detected.',
      delay_days: 0,
    };
  }

  const affectedRouteIds = new Set<string>();
  weatherEvents.forEach((e) => e.affected_route_ids.forEach((r) => affectedRouteIds.add(r)));

  const severityScore: Record<string, number> = { low: 20, medium: 45, high: 70, critical: 95 };
  const maxSeverity = weatherEvents.reduce((max, e) => {
    return severityScore[e.severity] > severityScore[max] ? e.severity : max;
  }, 'low' as string);

  const riskScore = Math.min(100, severityScore[maxSeverity] + (weatherEvents.length - 1) * 5);
  const affectedNames = [...affectedRouteIds]
    .map((id) => routes.find((r) => r.id === id)?.name ?? id)
    .join(', ');

  const delayMap: Record<string, number> = { low: 1, medium: 3, high: 7, critical: 14 };

  return {
    agent: 'weatherAgent',
    risk_score: riskScore,
    affected_route_ids: [...affectedRouteIds],
    summary: `${weatherEvents.length} active weather event(s) (max severity: ${maxSeverity}). Affected routes: ${affectedNames || 'none'}.`,
    delay_days: delayMap[maxSeverity] ?? 0,
  };
}
