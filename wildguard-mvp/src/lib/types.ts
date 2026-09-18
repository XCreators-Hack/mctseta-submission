/**
 * Core telemetry contract.
 *
 * The ESP32 firmware reports a detection status plus the boom-gate state
 * and control mode. This is a monitoring-only prototype: the frontend
 * reads this shape from the Express API and never writes back to the
 * device.
 */
export interface Telemetry {
  deviceId: string;
  distance: number;
  status: TelemetryStatus;
  gateState: GateState;
  controlMode: ControlMode;
  updatedAt: string; // ISO timestamp
}

export type TelemetryStatus = "road_clear" | "animal_crossing" | "animal_ahead";

export type GateState = "open" | "closed";

export type ControlMode = "auto" | "manual_override";

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
