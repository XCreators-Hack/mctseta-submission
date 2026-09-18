interface StatePanelProps {
  title: string;
  description?: string;
  tone?: "muted" | "danger";
}

/**
 * Used for the loading / API-offline / no-telemetry states so the dashboard
 * never renders a blank screen or throws when the backend isn't reachable.
 */
export default function StatePanel({ title, description, tone = "muted" }: StatePanelProps) {
  return (
    <div className="rounded border border-border bg-surface p-8 text-center">
      <div className={tone === "danger" ? "text-danger text-sm font-medium" : "text-text text-sm font-medium"}>
        {title}
      </div>
      {description && <div className="mt-1.5 text-xs text-muted">{description}</div>}
    </div>
  );
}
