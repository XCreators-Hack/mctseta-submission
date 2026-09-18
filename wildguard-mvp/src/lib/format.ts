import type { TelemetryStatus } from "./types";

const STATUS_LABELS: Record<string, string> = {
  very_close: "Very close",
  close: "Close",
  nearby: "Nearby",
  clear: "Clear",
};

export function formatStatusLabel(status: TelemetryStatus): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export type StatusTone = "critical" | "caution" | "positive" | "neutral";

// Visual tone per status. Only three colours are used in total (danger,
// accent, safe) — "neutral" reuses the muted grey already used for
// secondary text, so a fully clear reading doesn't compete for attention.
export function statusTone(status: TelemetryStatus): StatusTone {
  switch (status) {
    case "very_close":
      return "critical";
    case "close":
      return "caution";
    case "nearby":
      return "positive";
    case "clear":
      return "neutral";
    default:
      return "neutral";
  }
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 1) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
