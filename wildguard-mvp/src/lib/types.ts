/**
 * Core telemetry contract.
 *
 * The prototype only sends `distance`, but the API layer and dashboard are
 * written against this shape so that future fields (engineTemperature,
 * batteryVoltage, latitude/longitude, etc.) can be added to this interface
 * and picked up by new cards without touching the polling/fetch logic.
 */
export interface Telemetry {
  deviceId: string;
  distance: number;
  status: TelemetryStatus;
  updatedAt: string; // ISO timestamp

  // Reserved for future vehicle telemetry. Optional so the current
  // ESP32 payload (distance only) remains valid.
  engineTemperature?: number;
  batteryVoltage?: number;
  brakeStatus?: string;
  engineFault?: boolean;
  latitude?: number;
  longitude?: number;
}

export type TelemetryStatus = "very_close" | "close" | "nearby" | "clear" | string;

export interface HealthCheck {
  status: string;
  timestamp: string;
}

export interface ApiErrorBody {
  error: string;
}

/**
 * Discriminated result type so callers don't need try/catch scattered
 * everywhere — the service layer normalizes every failure mode (network
 * down, 404, malformed response) into one of these three states.
 */
export type TelemetryResult =
  | { kind: "ok"; data: Telemetry }
  | { kind: "not_found" }
  | { kind: "error"; message: string };

export type HealthResult =
  | { kind: "ok"; data: HealthCheck }
  | { kind: "error"; message: string };
