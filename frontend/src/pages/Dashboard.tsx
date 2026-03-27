import { useEffect, useState, useCallback } from 'react';
import MapView from '../components/MapView';
import SeverityBadge from '../components/SeverityBadge';
import { fetchRoutes } from '../api/client';
import type { RouteWithStatus, Disruption } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const [routes, setRoutes] = useState<RouteWithStatus[]>([]);
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchRoutes();
      setRoutes(data.routes);
      const allDisruptions = data.routes.flatMap((r) => r.disruptions);
      // De-duplicate by id
      const seen = new Set<string>();
      const unique = allDisruptions.filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });
      setDisruptions(unique);
      setError(null);
    } catch {
      setError('Failed to load route data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [load]);

  const affectedRoutes = routes.filter((r) => r.max_severity !== 'none');
  const clearRoutes = routes.filter((r) => r.max_severity === 'none');

  return (
    <div className="dashboard">
      <div className="dashboard-sidebar">
        <h2 className="sidebar-title">Global Routes</h2>

        {loading && <p className="sidebar-muted">Loading...</p>}
        {error && <p className="sidebar-error">{error}</p>}

        {affectedRoutes.length > 0 && (
          <div className="sidebar-section">
            <h3 className="section-label">⚠️ Affected</h3>
            {affectedRoutes.map((route) => (
              <div key={route.id} className="route-card route-card--affected">
                <div className="route-card-header">
                  <span className="route-name">{route.name}</span>
                  <SeverityBadge severity={route.max_severity} />
                </div>
                <p className="route-desc">{route.description}</p>
                {route.disruptions.map((d) => (
                  <div key={d.id} className="disruption-item">
                    <span className="disruption-type">{d.type}</span>
                    <span className="disruption-desc">{d.description}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-section">
          <h3 className="section-label">✅ Clear</h3>
          {clearRoutes.map((route) => (
            <div key={route.id} className="route-card">
              <div className="route-card-header">
                <span className="route-name">{route.name}</span>
                <SeverityBadge severity="none" />
              </div>
              <p className="route-desc">{route.description}</p>
              <div className="route-meta">
                <span>${route.base_cost_per_teu.toLocaleString()}/TEU</span>
                <span>{route.transit_days} days</span>
              </div>
            </div>
          ))}
        </div>

        {disruptions.length > 0 && (
          <div className="sidebar-section">
            <h3 className="section-label">🚨 Active Disruptions ({disruptions.length})</h3>
            {disruptions.map((d) => (
              <div key={d.id} className="disruption-card">
                <div className="disruption-card-header">
                  <span className="disruption-type">{d.type}</span>
                  <SeverityBadge severity={d.severity} />
                </div>
                <p className="disruption-desc">{d.description}</p>
                <p className="disruption-routes">
                  Routes: {d.affected_route_ids.join(', ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {disruptions.length === 0 && !loading && (
          <div className="sidebar-section">
            <p className="sidebar-muted">No active disruptions. Use Simulate to inject test events.</p>
          </div>
        )}
      </div>

      <div className="dashboard-map">
        <MapView routes={routes} disruptions={disruptions} height="100%" />
      </div>
    </div>
  );
}
