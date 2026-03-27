import { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import SeverityBadge from '../components/SeverityBadge';
import { fetchRoutes, planRoute } from '../api/client';
import type { RouteWithStatus, RouteRecommendation, Port } from '../types';
import './Planner.css';

export default function Planner() {
  const [routes, setRoutes] = useState<RouteWithStatus[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RouteRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutes().then((data) => {
      setRoutes(data.routes);
      setPorts(data.ports);
    });
  }, []);

  async function handlePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!origin || !destination) {
      setError('Please select both origin and destination.');
      return;
    }
    if (origin === destination) {
      setError('Origin and destination cannot be the same.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const rec = await planRoute(origin, destination);
      setResult(rec);
    } catch {
      setError('Failed to get route recommendation. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  const highlightRouteId = result?.recommended_route?.id;

  // Build display routes for map: highlight recommended, dim others in planner view
  const displayRoutes: RouteWithStatus[] = routes.map((r) => ({
    ...r,
    max_severity:
      result && r.id !== highlightRouteId && !result.alternative_routes.find((alt) => alt.id === r.id)
        ? r.max_severity
        : r.max_severity,
  }));

  return (
    <div className="planner-page">
      <div className="planner-layout">
        {/* Left panel */}
        <div className="planner-panel">
          <h1 className="page-title">🗺️ Route Planner</h1>
          <p className="page-subtitle">Find the safest and most cost-effective shipping route.</p>

          <form onSubmit={handlePlan} className="planner-form">
            <div className="form-group">
              <label className="form-label">Origin Port</label>
              <select
                className="form-select"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              >
                <option value="">Select origin...</option>
                {ports.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Port</label>
              <select
                className="form-select"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="">Select destination...</option>
                {ports.map((p) => (
                  <option key={p.code} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-text">
                  <span className="spinner" /> Analyzing routes...
                </span>
              ) : (
                '🔍 Find Safest Route'
              )}
            </button>
          </form>

          {result && (
            <div className="result-card">
              <div className="result-header">
                <h2 className="result-route-name">{result.recommended_route.name}</h2>
                <SeverityBadge severity={result.risk_level} />
              </div>

              <div className="result-metrics">
                <div className="metric">
                  <span className="metric-label">Est. Cost</span>
                  <span className="metric-value">${result.estimated_cost_usd.toLocaleString()}<span className="metric-unit">/TEU</span></span>
                </div>
                <div className="metric">
                  <span className="metric-label">Transit Time</span>
                  <span className="metric-value">{result.estimated_transit_days}<span className="metric-unit"> days</span></span>
                </div>
                <div className="metric">
                  <span className="metric-label">Risk Level</span>
                  <span className="metric-value" style={{ textTransform: 'capitalize' }}>{result.risk_level}</span>
                </div>
              </div>

              <div className="result-reasoning">
                <h4 className="reasoning-label">AI Analysis</h4>
                <p className="reasoning-text">{result.reasoning}</p>
              </div>

              {result.disruptions_considered.length > 0 && (
                <div className="result-disruptions">
                  <h4 className="reasoning-label">Disruptions Considered</h4>
                  {result.disruptions_considered.map((d) => (
                    <div key={d.id} className="considered-item">
                      <SeverityBadge severity={d.severity} />
                      <span className="considered-desc">{d.description}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.alternative_routes.length > 0 && (
                <div className="result-alternatives">
                  <h4 className="reasoning-label">Alternatives</h4>
                  {result.alternative_routes.map((r) => (
                    <div key={r.id} className="alt-route">
                      <span className="alt-name">{r.name}</span>
                      <span className="alt-meta">${r.base_cost_per_teu.toLocaleString()}/TEU · {r.transit_days} days</span>
                    </div>
                  ))}
                </div>
              )}

              {result.agent_reports.length > 0 && (
                <details className="agent-reports">
                  <summary className="agent-reports-summary">Agent Reports</summary>
                  {result.agent_reports.map((r) => (
                    <div key={r.agent} className="agent-report-item">
                      <span className="agent-name">{r.agent}</span>
                      <span className="agent-score">Risk: {r.risk_score}/100</span>
                      <p className="agent-summary">{r.summary}</p>
                    </div>
                  ))}
                </details>
              )}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="planner-map">
          <MapView
            routes={displayRoutes}
            disruptions={result?.disruptions_considered ?? []}
            highlightRouteId={highlightRouteId}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
