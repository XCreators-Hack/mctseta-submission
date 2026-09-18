export interface Alert {
  id: string;
  message: string;
  tone: "critical" | "caution" | "neutral";
}

interface AlertsPanelProps {
  title?: string;
  alerts: Alert[];
}

const DOT_TONE: Record<Alert["tone"], string> = {
  critical: "bg-danger",
  caution: "bg-accent",
  neutral: "bg-muted",
};

const TEXT_TONE: Record<Alert["tone"], string> = {
  critical: "text-danger",
  caution: "text-accent",
  neutral: "text-muted",
};

export default function AlertsPanel({ title = "Active Wildlife Alerts", alerts }: AlertsPanelProps) {
  return (
    <div className="rounded border border-border bg-surface p-4">
      <div className="text-sm text-muted mb-3">{title}</div>
      {alerts.length === 0 ? (
        <div className="text-xs text-muted">No active alerts.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <li key={alert.id} className={["flex items-center gap-2 text-xs", TEXT_TONE[alert.tone]].join(" ")}>
              <span className={["h-1.5 w-1.5 rounded-full shrink-0", DOT_TONE[alert.tone]].join(" ")} />
              {alert.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
