import type { CorridorState } from "@/types";

/**
 * Corridor state machine:
 *
 *   NORMAL -> HAZARD_DETECTED -> WARNING_ACTIVE -> INTERVENTION_ACTIVE -> CLEARANCE -> NORMAL
 *
 * A raw sensor reading only ever *proposes* a transition — it never assumes
 * a real road should physically close. The servo/boom gate in the hardware
 * MVP is a prototype representation of an automated intervention response,
 * not a claim about real-world infrastructure control.
 */

export const CORRIDOR_TRANSITIONS: Record<CorridorState, CorridorState> = {
  NORMAL: "HAZARD_DETECTED",
  HAZARD_DETECTED: "WARNING_ACTIVE",
  WARNING_ACTIVE: "INTERVENTION_ACTIVE",
  INTERVENTION_ACTIVE: "CLEARANCE",
  CLEARANCE: "NORMAL",
};

export interface CorridorStateProfile {
  label: string;
  speedLimitKmh: number;
  gate: "OPEN" | "CLOSED";
  ledColor: "green" | "yellow" | "red";
  mapColor: "green" | "yellow" | "red";
  description: string;
}

export const CORRIDOR_STATE_PROFILES: Record<CorridorState, CorridorStateProfile> = {
  NORMAL: {
    label: "Normal",
    speedLimitKmh: 80,
    gate: "OPEN",
    ledColor: "green",
    mapColor: "green",
    description: "No hazard detected. Corridor operating normally.",
  },
  HAZARD_DETECTED: {
    label: "Hazard Detected",
    speedLimitKmh: 60,
    gate: "OPEN",
    ledColor: "yellow",
    mapColor: "yellow",
    description: "Sensor threshold breached. Confirming hazard.",
  },
  WARNING_ACTIVE: {
    label: "Warning Active",
    speedLimitKmh: 40,
    gate: "OPEN",
    ledColor: "yellow",
    mapColor: "yellow",
    description: "Drivers are being warned. Reduce speed.",
  },
  INTERVENTION_ACTIVE: {
    label: "Intervention Active",
    speedLimitKmh: 0,
    gate: "CLOSED",
    ledColor: "red",
    mapColor: "red",
    description: "Automated intervention active. Stop / restricted movement.",
  },
  CLEARANCE: {
    label: "Clearance",
    speedLimitKmh: 40,
    gate: "OPEN",
    ledColor: "yellow",
    mapColor: "yellow",
    description: "Hazard cleared. Returning to normal after the clearance period.",
  },
};

export function nextCorridorState(current: CorridorState): CorridorState {
  return CORRIDOR_TRANSITIONS[current];
}

/** How long (ms) a corridor stays in CLEARANCE before auto-returning to NORMAL. */
export const CLEARANCE_PERIOD_MS = 20_000;
