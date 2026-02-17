interface GaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
}

export function Gauge({ label, value, min = 0, max = 100 }: GaugeProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="gauge">
      <div className="gauge-label">{label}</div>
      <div className="gauge-track">
        <div className="gauge-marker" style={{ left: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
    </div>
  );
}
