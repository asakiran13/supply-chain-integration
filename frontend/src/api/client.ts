import axios from 'axios';
import type { Disruption, RouteRecommendation, RoutesResponse } from '../types';

const api = axios.create({ baseURL: '/api' });

export async function fetchRoutes(): Promise<RoutesResponse> {
  const res = await api.get<RoutesResponse>('/routes');
  return res.data;
}

export async function fetchDisruptions(): Promise<Disruption[]> {
  const res = await api.get<Disruption[]>('/disruptions');
  return res.data;
}

export async function createDisruption(payload: Omit<Disruption, 'id' | 'created_at'>): Promise<Disruption> {
  const res = await api.post<Disruption>('/disruptions', payload);
  return res.data;
}

export async function deleteDisruption(id: string): Promise<void> {
  await api.delete(`/disruptions/${id}`);
}

export async function planRoute(origin: string, destination: string): Promise<RouteRecommendation> {
  const res = await api.post<RouteRecommendation>('/plan', { origin, destination });
  return res.data;
}
