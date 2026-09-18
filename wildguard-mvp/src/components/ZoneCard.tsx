"use client";

import type { ReactNode } from "react";
import { useTelemetry, isTelemetryFresh } from "@/lib/useTelemetry";
import { STALE_THRESHOLD_MS } from "@/lib/config";
import { detectionLabel, detectionTone, gateStateLabel, controlModeLabel } from "@/lib/format";
import type { Telemetry } from "@/lib/types";
import type { CrossingZone } from "@/data/zones";
import ConnectionStatus from "./ConnectionStatus";
import LastUpdated from "./LastUpdated";

interface ZoneCardProps {
  zone: CrossingZone;
  /** Render-prop so pages can drop in a DirectiveBanner, BoomGateCard,
   * etc. using this zone's own telemetry, without polling it twice. */
  children?: (ctx: { telemetry: Telemetry | null; isOnline: boolean }) => ReactNode;
}

const TONE_TEXT: Record<string, string> = {
  critical: "text-danger",
  caution: "text-accent",
  positive: "text-safe",
  neutral: "text-muted",
};

/**
 * A single crossing zone's live status: which unit covers it, current
 * detection condition, gate state, and connectivity. This is a
 * configuration/demo record (see src/data/zones.ts) — it never invents a
 * reading when the associated device has no telemetry.
 */
export default function ZoneCard({ zone, children }: ZoneCardProps) {
  const { telemetry, connectionState } = useTelemetry(zone.deviceId);
  const isFresh = telemetry ? isTelemetryFresh(telemetry.updatedAt, STALE_THRESHOLD_MS) : false;
  const isOnline = connectionState === "online" && isFresh;

  return (
    <div className="rounded border border-border bg-surface p-4 md:p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-text">{zone.name}</div>
          <div className="text-xs text-muted mono mt-0.5">{zone.deviceId}</div>
        </div>
        <ConnectionStatus online={isOnline} label={isOnline ? "Online" : "Offline"} />
      </div>

      {connectionState === "connecting" && <p className="text-xs text-muted">Connecting…</p>}

      {connectionState === "offline" && (
        <p className="text-xs text-danger">Unable to reach the EcoWildGuard API.</p>
      )}

      {connectionState === "no_telemetry" && (
        <p className="text-xs text-muted">No telemetry received from this unit yet.</p>
      )}

      {connectionState === "online" && telemetry && !isFresh && (
        <p className="text-xs text-danger">
          Last seen {new Date(telemetry.updatedAt).toLocaleTimeString()} — telemetry has stopped
          updating.
        </p>
      )}

      {telemetry && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="text-muted">Condition</div>
          <div className={["text-right font-medium", TONE_TEXT[detectionTone(telemetry.status)]].join(" ")}>
            {detectionLabel(telemetry.status)}
          </div>
          <div className="text-muted">Gate</div>
          <div className="text-right text-text">{gateStateLabel(telemetry.gateState)}</div>
          <div className="text-muted">Mode</div>
          <div className="text-right text-text">{controlModeLabel(telemetry.controlMode)}</div>
          <div className="text-muted">Last update</div>
          <div className="text-right">
            <LastUpdated isoString={telemetry.updatedAt} />
          </div>
        </div>
      )}

      {children?.({ telemetry: telemetry ?? null, isOnline })}
    </div>
  );
}
