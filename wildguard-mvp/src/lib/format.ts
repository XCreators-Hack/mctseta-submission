import type { ControlMode, GateState, TelemetryStatus } from "./types";

export type StatusTone = "critical" | "caution" | "positive" | "neutral";

const DETECTION_LABELS: Record<TelemetryStatus, string> = {
  road_clear: "Road clear",
  animal_crossing: "Animal crossing detected",
  animal_ahead: "Animal ahead",
};

export function detectionLabel(status: TelemetryStatus): string {
  return DETECTION_LABELS[status] ?? status;
}

// Visual tone per detection status. Only three colours are used in total
// (danger, accent, safe) so a fully clear reading doesn't compete for
// attention with an active alert.
export function detectionTone(status: TelemetryStatus): StatusTone {
  switch (status) {
    case "animal_ahead":
      return "critical";
    case "animal_crossing":
      return "caution";
    case "road_clear":
      return "positive";
    default:
      return "neutral";
  }
}

/**
 * The directive a driver should follow right now, based on live
 * telemetry. Used on the Fleet / Logistics view.
 */
export function driverDirective(status: TelemetryStatus): "PROCEED" | "SLOW DOWN" | "STOP" {
  switch (status) {
    case "road_clear":
      return "PROCEED";
    case "animal_crossing":
      return "SLOW DOWN";
    case "animal_ahead":
      return "STOP";
    default:
      return "STOP";
  }
}

const DETECTION_SUBLINES: Record<TelemetryStatus, string> = {
  road_clear: "Safe to proceed",
  animal_crossing: "Animal crossing detected",
  animal_ahead: "Animal ahead",
};

export function detectionSubline(status: TelemetryStatus): string {
  return DETECTION_SUBLINES[status] ?? "";
}

export function gateStateLabel(gateState: GateState): string {
  return gateState === "open" ? "Open" : "Closed";
}

export function controlModeLabel(mode: ControlMode): string {
  return mode === "manual_override" ? "Manual override" : "Automatic";
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
