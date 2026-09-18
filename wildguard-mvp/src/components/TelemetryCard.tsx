interface TelemetryCardProps {
  label: string;
  value: string;
  unit?: string;
  statusLabel?: string;
  tone?: "critical" | "caution" | "positive" | "neutral";
}

const TONE_BAR: Record<string, string> = {
  critical: "bg-danger",
  caution: "bg-accent",
  positive: "bg-safe",
  neutral: "bg-border",
};

const TONE_TEXT: Record<string, string> = {
  critical: "text-danger",
  caution: "text-accent",
  positive: "text-safe",
  neutral: "text-muted",
};

/**
 * A compact secondary-reading panel, for telemetry that isn't the current
 * hero metric — engine temperature, battery voltage, etc. once those exist.
 * Hierarchy is a 3px accent bar, not a full coloured border.
 */
export default function TelemetryCard({
  label,
  value,
  unit,
  statusLabel,
  tone = "neutral",
}: TelemetryCardProps) {
  return (
    <div className="relative overflow-hidden rounded border border-border bg-surface p-4 pl-5">
      <span className={["absolute left-0 top-0 h-full w-1", TONE_BAR[tone]].join(" ")} />
      <div className="text-sm text-muted mb-2">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="mono text-2xl font-semibold text-text">{value}</span>
        {unit && <span className="text-sm text-muted">{unit}</span>}
      </div>
      {statusLabel && (
        <div className={["mt-2 text-xs font-medium", TONE_TEXT[tone]].join(" ")}>{statusLabel}</div>
      )}
    </div>
  );
}
