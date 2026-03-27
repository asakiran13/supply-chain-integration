import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';
import { fetchDisruptions, createDisruption, deleteDisruption } from '../api/client';
import type { Disruption, DisruptionType, Severity } from '../types';
import './Simulate.css';

const ROUTE_OPTIONS = [
  { id: 'suez-canal', label: 'Suez Canal' },
  { id: 'cape-of-good-hope', label: 'Cape of Good Hope' },
  { id: 'panama-canal', label: 'Panama Canal' },
  { id: 'strait-of-hormuz', label: 'Strait of Hormuz' },
];

const TYPE_OPTIONS: DisruptionType[] = ['weather', 'geopolitical', 'traffic', 'infrastructure'];
const SEVERITY_OPTIONS: Severity[] = ['low', 'medium', 'high', 'critical'];

// Preset test scenarios for quick injection
const PRESETS = [
  {
    label: 'War blocks Suez Canal',
    type: 'geopolitical' as DisruptionType,
    affected_route_ids: ['suez-canal'],
    severity: 'critical' as Severity,
    description: 'Armed conflict in Red Sea region has closed Suez Canal to all commercial traffic.',
    location: [32.5, 29.9] as [number, number],
  },
  {
    label: 'Hurricane in Gulf / Panama',
    type: 'weather' as DisruptionType,
    affected_route_ids: ['panama-canal'],
    severity: 'high' as Severity,
    description: 'Category 4 hurricane is disrupting operations at Panama Canal. 7-day closure expected.',
    location: [-79.9, 9.0] as [number, number],
  },
  {
    label: 'Hormuz tanker seizure',
    type: 'geopolitical' as DisruptionType,
    affected_route_ids: ['strait-of-hormuz'],
    severity: 'critical' as Severity,
    description: 'Multiple tanker seizures reported in Strait of Hormuz. Transit risks extremely high.',
    location: [56.5, 26.6] as [number, number],
  },
  {
    label: 'Port congestion at Cape Town',
    type: 'traffic' as DisruptionType,
    affected_route_ids: ['cape-of-good-hope'],
    severity: 'medium' as Severity,
    description: 'Severe port congestion at Cape Town causing 3-day delays on Cape of Good Hope route.',
    location: [18.5, -34.2] as [number, number],
  },
];

const LOCATION_MAP: Record<string, [number, number]> = {
  'suez-canal': [32.5, 29.9],
  'cape-of-good-hope': [18.5, -34.2],
  'panama-canal': [-79.9, 9.0],
  'strait-of-hormuz': [56.5, 26.6],
};

interface FormState {
  type: DisruptionType;
  affected_route_ids: string[];
  severity: Severity;
  description: string;
}

export default function Simulate() {
  const navigate = useNavigate();
  const [disruptions, setDisruptions] = useState<Disruption[]>([]);
  const [form, setForm] = useState<FormState>({
    type: 'weather',
    affected_route_ids: ['suez-canal'],
    severity: 'medium',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDisruptions() {
    const data = await fetchDisruptions();
    setDisruptions(data);
  }

  useEffect(() => {
    loadDisruptions();
  }, []);

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setForm({
      type: preset.type,
      affected_route_ids: preset.affected_route_ids,
      severity: preset.severity,
      description: preset.description,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const location = form.affected_route_ids.length === 1
        ? LOCATION_MAP[form.affected_route_ids[0]]
        : undefined;
      await createDisruption({ ...form, location });
      setSuccessMsg('Disruption injected! Redirecting to dashboard...');
      await loadDisruptions();
      setForm({ type: 'weather', affected_route_ids: ['suez-canal'], severity: 'medium', description: '' });
      setTimeout(() => {
        setSuccessMsg(null);
        navigate('/dashboard');
      }, 1500);
    } catch {
      setError('Failed to inject disruption.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteDisruption(id);
      await loadDisruptions();
    } catch {
      setError('Failed to delete disruption.');
    } finally {
      setDeleting(null);
    }
  }

  function toggleRoute(routeId: string) {
    setForm((prev) => ({
      ...prev,
      affected_route_ids: prev.affected_route_ids.includes(routeId)
        ? prev.affected_route_ids.filter((r) => r !== routeId)
        : [...prev.affected_route_ids, routeId],
    }));
  }

  return (
    <div className="simulate-page">
      <div className="simulate-container">
        <h1 className="page-title">⚡ Simulate Disruption</h1>
        <p className="page-subtitle">
          Inject test disruptions to see how the system responds. Use presets for quick scenarios.
        </p>

        {/* Presets */}
        <div className="presets-section">
          <h3 className="form-section-label">Quick Scenarios</h3>
          <div className="presets-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className="preset-btn"
                onClick={() => applyPreset(preset)}
                type="button"
              >
                <span className="preset-label">{preset.label}</span>
                <SeverityBadge severity={preset.severity} />
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="simulate-form">
          <h3 className="form-section-label">Custom Disruption</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as DisruptionType }))}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <select
                className="form-select"
                value={form.severity}
                onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value as Severity }))}
              >
                {SEVERITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Affected Routes</label>
            <div className="route-checkboxes">
              {ROUTE_OPTIONS.map((r) => (
                <label key={r.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.affected_route_ids.includes(r.id)}
                    onChange={() => toggleRoute(r.id)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Describe the disruption event..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          {successMsg && <p className="form-success">{successMsg}</p>}

          <button type="submit" className="submit-btn" disabled={submitting || form.affected_route_ids.length === 0}>
            {submitting ? 'Injecting...' : '⚡ Inject Disruption'}
          </button>
        </form>

        {/* Active disruptions table */}
        <div className="active-section">
          <h3 className="form-section-label">Active Disruptions ({disruptions.length})</h3>
          {disruptions.length === 0 ? (
            <p className="muted">No active disruptions.</p>
          ) : (
            <table className="disruptions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Routes</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {disruptions.map((d) => (
                  <tr key={d.id}>
                    <td><span className="type-tag">{d.type}</span></td>
                    <td><SeverityBadge severity={d.severity} /></td>
                    <td className="routes-cell">{d.affected_route_ids.join(', ')}</td>
                    <td className="desc-cell">{d.description}</td>
                    <td className="date-cell">{new Date(d.created_at).toLocaleTimeString()}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                      >
                        {deleting === d.id ? '...' : '✕'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
