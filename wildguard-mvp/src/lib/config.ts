// Central place for the values the whole app agrees on. Change here, not
// in individual components.

export const DEVICE_ID = "ecowildguard-001";
export const DEVICE_NAME = "EcoWildGuard Unit 01";

export const POLL_INTERVAL_MS = 2000;

// Telemetry older than this is treated as stale / device offline.
export const STALE_THRESHOLD_MS = 10_000;
