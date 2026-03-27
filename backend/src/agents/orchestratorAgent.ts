import OpenAI from 'openai';
import { AgentReport, Disruption, RouteRecommendation, Severity, ShippingRoute } from '../types/index.js';
import { weatherAgent } from './weatherAgent.js';
import { newsAgent } from './newsAgent.js';
import { trafficAgent } from './trafficAgent.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SURCHARGE: Record<string, number> = { none: 0, low: 0.05, medium: 0.15, high: 0.30, critical: 0.50 };

function computeCost(route: ShippingRoute, severity: string): number {
  return Math.round(route.base_cost_per_teu * (1 + (SURCHARGE[severity] ?? 0)));
}

function maxSeverity(reports: AgentReport[], affectedRouteId: string): Severity | 'none' {
  const order: (Severity | 'none')[] = ['none', 'low', 'medium', 'high', 'critical'];
  let max: Severity | 'none' = 'none';
  for (const report of reports) {
    if (report.affected_route_ids.includes(affectedRouteId)) {
      const score = (s: string) => order.indexOf(s as Severity);
      if (score(report.agent === 'newsAgent' ? 'high' : 'medium') > score(max)) {
        // use risk_score to derive severity dynamically
      }
    }
  }
  // derive severity from risk_score across all affecting agents
  const affectingScores = reports
    .filter((r) => r.affected_route_ids.includes(affectedRouteId))
    .map((r) => r.risk_score);
  if (affectingScores.length === 0) return 'none';
  const avgScore = affectingScores.reduce((a, b) => a + b, 0) / affectingScores.length;
  if (avgScore >= 80) return 'critical';
  if (avgScore >= 55) return 'high';
  if (avgScore >= 30) return 'medium';
  return 'low';
}

function findCandidateRoutes(
  origin: string,
  destination: string,
  allRoutes: ShippingRoute[]
): ShippingRoute[] {
  // Build a simple set of routes that connect origin-region corridors to destination-region corridors.
  // For MVP we use the static port-to-route mapping from route.corridor tags.
  // Heuristic: pick routes whose corridor contains at least one of the inferred regions.
  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();

  const regionKeywords: Record<string, string[]> = {
    europe: ['rotterdam', 'hamburg', 'antwerp', 'netherlands', 'germany', 'europe', 'med'],
    asia: ['shanghai', 'singapore', 'busan', 'korea', 'china', 'japan', 'asia', 'hong kong'],
    'middle-east': ['dubai', 'uae', 'bahrain', 'qatar', 'kuwait', 'saudi', 'gulf', 'hormuz'],
    americas: ['new york', 'houston', 'los angeles', 'usa', 'us', 'america', 'panama'],
    'indian-ocean': ['mumbai', 'colombo', 'india', 'sri lanka'],
    africa: ['cape town', 'south africa', 'african'],
    pacific: ['pacific', 'los angeles', 'la', 'seattle'],
  };

  function inferRegions(portName: string): string[] {
    return Object.entries(regionKeywords)
      .filter(([, keywords]) => keywords.some((k) => portName.includes(k)))
      .map(([region]) => region);
  }

  const originRegions = inferRegions(originLower);
  const destRegions = inferRegions(destLower);

  // A route is a candidate if it touches both origin and destination regions
  const candidates = allRoutes.filter((route) => {
    const touchesOrigin =
      originRegions.length === 0 || originRegions.some((r) => route.corridor.includes(r));
    const touchesDest =
      destRegions.length === 0 || destRegions.some((r) => route.corridor.includes(r));
    return touchesOrigin && touchesDest;
  });

  return candidates.length > 0 ? candidates : allRoutes;
}

export async function orchestratorAgent(
  origin: string,
  destination: string,
  disruptions: Disruption[],
  allRoutes: ShippingRoute[]
): Promise<RouteRecommendation> {
  // Step 1: Run all specialist agents in parallel
  const [weatherReport, newsReport, trafficReport] = await Promise.all([
    weatherAgent(disruptions, allRoutes),
    newsAgent(disruptions, allRoutes),
    trafficAgent(disruptions, allRoutes),
  ]);
  const agentReports: AgentReport[] = [weatherReport, newsReport, trafficReport];

  // Step 2: Find candidate routes for this O-D pair
  const candidates = findCandidateRoutes(origin, destination, allRoutes);

  // Step 3: Score each candidate (lower = better)
  const scored = candidates.map((route) => {
    const sev = maxSeverity(agentReports, route.id);
    const sevOrder: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
    return { route, severity: sev, sevScore: sevOrder[sev] ?? 0, cost: computeCost(route, sev) };
  });

  scored.sort((a, b) => a.sevScore - b.sevScore || a.cost - b.cost);
  const best = scored[0];
  const alternatives = scored.slice(1).map((s) => s.route);

  // Step 4: Ask GPT-4o for a human-readable reasoning summary
  const agentSummaries = agentReports.map((r) => `${r.agent}: ${r.summary}`).join('\n');
  const candidateSummary = scored
    .map((s) => `- ${s.route.name} | severity: ${s.severity} | est. cost: $${s.cost}/TEU | transit: ${s.route.transit_days + (agentReports[0].delay_days ?? 0)} days`)
    .join('\n');

  const prompt = `You are an expert maritime logistics advisor. Analyze the following shipping scenario and explain the routing recommendation clearly and concisely (3-4 sentences max).

Origin: ${origin}
Destination: ${destination}

Active disruption agents reported:
${agentSummaries}

Route options evaluated:
${candidateSummary}

Recommended route: ${best.route.name}

Explain why ${best.route.name} is the best choice given current conditions, and briefly mention the trade-offs of alternatives if any exist.`;

  let reasoning = `Recommended route: ${best.route.name} based on lowest risk score and cost.`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
    });
    reasoning = completion.choices[0]?.message?.content ?? reasoning;
  } catch {
    // fallback to static reasoning if OpenAI call fails
  }

  const totalDelay = Math.max(...agentReports.map((r) => r.delay_days ?? 0));

  return {
    recommended_route: best.route,
    alternative_routes: alternatives,
    estimated_cost_usd: best.cost,
    estimated_transit_days: best.route.transit_days + totalDelay,
    risk_level: best.severity,
    reasoning,
    disruptions_considered: disruptions,
    agent_reports: agentReports,
  };
}
