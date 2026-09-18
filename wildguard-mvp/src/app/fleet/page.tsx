"use client";

import { CROSSING_ZONES } from "@/data/zones";
import { useTelemetry, isTelemetryFresh } from "@/lib/useTelemetry";
import { STALE_THRESHOLD_MS } from "@/lib/config";
import { gateStateLabel } from "@/lib/format";
import DirectiveBanner from "@/components/DirectiveBanner";
import BoomGateCard from "@/components/BoomGateCard";
import ConnectionStatus from "@/components/ConnectionStatus";

/**
 * Driver/logistics-facing view. One route, stop by stop: for each
 * wildlife-sensitive zone, whether it's clear or blocked right now, and
 * the boom-gate state as reported by the device.
 */
export default function FleetPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <p className="text-xs text-muted">
        Route awareness for wildlife-sensitive crossings ahead. Directives and gate status update
        from live telemetry reported by each device.
      </p>

      {CROSSING_ZONES.map((zone) => (
        <RouteStop key={zone.id} zoneId={zone.id} zoneName={zone.name} deviceId={zone.deviceId} />
      ))}
    </div>
  );
}

function RouteStop({ zoneName, deviceId }: { zoneId: string; zoneName: string; deviceId: string }) {
  const { telemetry, connectionState } = useTelemetry(deviceId);
  const isFresh = telemetry ? isTelemetryFresh(telemetry.updatedAt, STALE_THRESHOLD_MS) : false;
  const isOnline = connectionState === "online" && isFresh;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text">{zoneName}</h2>
        <ConnectionStatus online={isOnline} label={isOnline ? "Online" : "Offline"} />
      </div>

      {connectionState === "connecting" && (
        <div className="rounded border border-border bg-surface p-6 text-center text-xs text-muted">
          Connecting…
        </div>
      )}

      {connectionState === "offline" && (
        <div className="rounded border border-danger bg-danger/10 p-6 text-center text-xs text-danger">
          Unable to reach the EcoWildGuard API — treat this crossing as unconfirmed and proceed with
          caution.
        </div>
      )}

      {connectionState === "no_telemetry" && (
        <div className="rounded border border-border bg-surface p-6 text-center text-xs text-muted">
          No telemetry from this unit yet.
        </div>
      )}

      {telemetry && !isFresh && (
        <div className="rounded border border-danger bg-danger/10 p-6 text-center text-xs text-danger">
          Unit offline — last seen {new Date(telemetry.updatedAt).toLocaleTimeString()}. Treat this
          crossing as unconfirmed and proceed with caution.
        </div>
      )}

      {telemetry && isFresh && (
        <>
          <DirectiveBanner status={telemetry.status} variant="driver" />
          <div className="text-xs text-muted text-center -mt-2">
            Boom gate: <span className="text-text">{gateStateLabel(telemetry.gateState)}</span>
          </div>
          <BoomGateCard telemetry={telemetry} isOnline={isOnline} />
        </>
      )}
    </div>
  );
}
