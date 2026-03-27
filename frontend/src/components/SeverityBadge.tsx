import type { Severity } from '../types';

const SEVERITY_LABEL: Record<string, string> = {
  none: 'Clear',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const SEVERITY_CLASS: Record<string, string> = {
  none: 'badge-none',
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
};

interface Props {
  severity: Severity | 'none';
}

export default function SeverityBadge({ severity }: Props) {
  return (
    <span className={`severity-badge ${SEVERITY_CLASS[severity] ?? 'badge-none'}`}>
      {SEVERITY_LABEL[severity] ?? severity}
    </span>
  );
}
