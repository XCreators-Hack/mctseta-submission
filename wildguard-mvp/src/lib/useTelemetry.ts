"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getTelemetry } from "./api";
import type { Telemetry } from "./types";
import { POLL_INTERVAL_MS } from "./config";

export type ConnectionState = "connecting" | "online" | "offline" | "no_telemetry";

export interface UseTelemetryResult {
  telemetry: Telemetry | null;
  connectionState: ConnectionState;
  errorMessage: string | null;
}

/**
 * Polls GET /api/telemetry/:deviceId on a fixed interval.
 *
 * - Fetches immediately on mount, then every POLL_INTERVAL_MS.
 * - Uses a ref-based in-flight guard so a slow request can't overlap
 *   with the next tick.
 * - Cleans up the interval and aborts any in-flight request on unmount.
 * - Never throws into the component; all failure states are represented
 *   in `connectionState` / `errorMessage`.
 */
export function useTelemetry(deviceId: string): UseTelemetryResult {
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inFlightRef = useRef(false);

  const poll = useCallback(
    async (signal: AbortSignal) => {
      if (inFlightRef.current) return; // avoid overlapping requests
      inFlightRef.current = true;

      const result = await getTelemetry(deviceId, signal);

      // If the request was aborted (component unmounted mid-flight),
      // don't touch state at all.
      if (signal.aborted) {
        inFlightRef.current = false;
        return;
      }

      switch (result.kind) {
        case "ok":
          setTelemetry(result.data);
          setErrorMessage(null);
          setConnectionState("online");
          break;
        case "not_found":
          setTelemetry(null);
          setErrorMessage(null);
          setConnectionState("no_telemetry");
          break;
        case "error":
          setErrorMessage(result.message);
          setConnectionState("offline");
          break;
      }

      inFlightRef.current = false;
    },
    [deviceId]
  );

  useEffect(() => {
    const controller = new AbortController();

    // Fetch immediately on mount.
    poll(controller.signal);

    const intervalId = setInterval(() => {
      poll(controller.signal);
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [poll]);

  return { telemetry, connectionState, errorMessage };
}

/**
 * Derives an online/offline verdict from a telemetry timestamp, independent
 * of whether the last poll succeeded. Used so a device that stops sending
 * data (but the API itself is still reachable) is correctly shown offline
 * rather than "online" just because the last HTTP call succeeded.
 */
export function isTelemetryFresh(updatedAt: string, staleThresholdMs: number): boolean {
  const updatedTime = new Date(updatedAt).getTime();
  if (Number.isNaN(updatedTime)) return false;
  return Date.now() - updatedTime <= staleThresholdMs;
}
