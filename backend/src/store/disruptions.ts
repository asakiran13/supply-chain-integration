import { Disruption } from '../types/index.js';

// In-memory disruptions store — resets on server restart (MVP)
const disruptions: Disruption[] = [];

export function getAllDisruptions(): Disruption[] {
  return [...disruptions];
}

export function addDisruption(disruption: Disruption): void {
  disruptions.push(disruption);
}

export function removeDisruption(id: string): boolean {
  const index = disruptions.findIndex((d) => d.id === id);
  if (index === -1) return false;
  disruptions.splice(index, 1);
  return true;
}

export function getDisruptionsForRoute(routeId: string): Disruption[] {
  return disruptions.filter((d) => d.affected_route_ids.includes(routeId));
}
