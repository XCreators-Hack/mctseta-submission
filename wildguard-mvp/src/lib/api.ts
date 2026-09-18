import type { HealthResult, TelemetryResult } from "./types";

/**
 * Single source of truth for the (public) API base URL used for reading
 * telemetry directly from the browser. Never hardcode the address
 * anywhere else in the app — import getApiBaseUrl() or the functions
 * below.
 *
 * This is separate from the server-only URL/key used to send commands —
 * see src/lib/commands.ts and src/app/api/device-command/route.ts. Reads
 * are unauthenticated and safe to make directly from the client; writes
 * are not.
 */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    // Fail loudly in dev so a missing .env.local is obvious, but don't
    // throw — the UI still needs to render an "unavailable" state.
    console.error(
      "NEXT_PUBLIC_API_URL is not set. Create a .env.local from .env.local.example."
    );
    return "";
  }
  return url.replace(/\/$/, "");
}

/**
 * Fetch the latest telemetry reading for a device.
 *
 * Normalizes every failure mode into a TelemetryResult so callers never
 * need to inspect HTTP status codes or catch exceptions themselves.
 */
export async function getTelemetry(
  deviceId: string,
  signal?: AbortSignal
): Promise<TelemetryResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { kind: "error", message: "API URL is not configured." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/telemetry/${encodeURIComponent(deviceId)}`, {
      method: "GET",
      cache: "no-store",
      signal,
    });

    if (res.status === 404) {
      return { kind: "not_found" };
    }

    if (!res.ok) {
      console.error(`Telemetry request failed: ${res.status} ${res.statusText}`);
      return { kind: "error", message: `API returned ${res.status}` };
    }

    const data = await res.json();
    return { kind: "ok", data };
  } catch (err) {
    // AbortError happens on unmount/cleanup — not a real failure, but the
    // caller's interval will simply try again, so we still report it as
    // an error result rather than throwing.
    if (err instanceof DOMException && err.name === "AbortError") {
      return { kind: "error", message: "Request aborted" };
    }
    console.error("Telemetry request threw:", err);
    return { kind: "error", message: "Unable to reach EcoWildGuard API" };
  }
}

/**
 * Fetch API health status. Used by the System page.
 */
export async function getHealth(signal?: AbortSignal): Promise<HealthResult> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return { kind: "error", message: "API URL is not configured." };
  }

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: "GET",
      cache: "no-store",
      signal,
    });

    if (!res.ok) {
      return { kind: "error", message: `API returned ${res.status}` };
    }

    const data = await res.json();
    return { kind: "ok", data };
  } catch (err) {
    console.error("Health check threw:", err);
    return { kind: "error", message: "Unable to reach EcoWildGuard API" };
  }
}
