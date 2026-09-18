"use client";

import { useTelemetry, isTelemetryFresh } from "@/lib/useTelemetry";
import { DEVICE_ID, STALE_THRESHOLD_MS } from "@/lib/config";
import { controlModeLabel } from "@/lib/format";
import DeviceStatus from "@/components/DeviceStatus";
import DirectiveBanner from "@/components/DirectiveBanner";
import BoomGateCard from "@/components/BoomGateCard";
import TelemetryCard from "@/components/TelemetryCard";
import AlertsPanel, { type Alert } from "@/components/AlertsPanel";
import StatePanel from "@/components/StatePanel";
import LastUpdated from "@/components/LastUpdated";

export default function OverviewPage() {
  const { telemetry, connectionState, errorMessage } = useTelemetry(DEVICE_ID);

  const isFresh = telemetry ? isTelemetryFresh(telemetry.updatedAt, STALE_THRESHOLD_MS) : false;
  const isOnline = connectionState === "online" && isFresh;

  const alerts: Alert[] = [];
  if (connectionState === "offline") {
    alerts.push({ id: "api-offline", message: "EcoWildGuard API is unreachable.", tone: "critical" });
  } else if (telemetry && !isFresh) {
    alerts.push({ id: "device-offline", message: "Unit 01 has stopped reporting telemetry.", tone: "critical" });
  } else if (telemetry) {
    if (telemetry.status === "animal_ahead") {
      alerts.push({ id: "animal-ahead", message: "Animal ahead at Wildlife Crossing Zone 01.", tone: "critical" });
    } else if (telemetry.status === "animal_crossing") {
      alerts.push({ id: "animal-crossing", message: "Animal crossing detected at Wildlife Crossing Zone 01.", tone: "caution" });
    }
    if (telemetry.controlMode === "manual_override") {
      alerts.push({ id: "manual-override", message: "Boom gate under manual override.", tone: "caution" });
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <DeviceStatus online={isOnline} updatedAt={telemetry?.updatedAt ?? null} />

      {connectionState === "connecting" && (
        <StatePanel title="Connecting to device..." description="Fetching latest telemetry from the API." />
      )}

      {connectionState === "offline" && (
        <StatePanel
          title="Unable to connect to EcoWildGuard API"
          description={errorMessage ?? "Check that the Express API is running on the configured URL."}
          tone="danger"
        />
      )}

      {connectionState === "no_telemetry" && (
        <StatePanel
          title="Waiting for device telemetry..."
          description="The API is reachable but has not received a reading from this device yet."
        />
      )}

      {connectionState === "online" && telemetry && !isFresh && (
        <StatePanel
          title="Device Offline"
          description={`Last seen ${new Date(telemetry.updatedAt).toLocaleTimeString()} — telemetry has stopped updating.`}
          tone="danger"
        />
      )}

      {telemetry && (
        <>
          <DirectiveBanner status={telemetry.status} variant="command" />

          <div className="grid gap-4 md:grid-cols-2">
            <BoomGateCard telemetry={isFresh ? telemetry : null} isOnline={isOnline} />
            <AlertsPanel alerts={alerts} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <TelemetryCard label="Sensor Distance" value={telemetry.distance.toFixed(1)} unit="cm" />
            <TelemetryCard
              label="Control Mode"
              value={controlModeLabel(telemetry.controlMode)}
              tone={telemetry.controlMode === "manual_override" ? "caution" : "neutral"}
            />
            <div className="relative overflow-hidden rounded border border-border bg-surface p-4 pl-5">
              <span className="absolute left-0 top-0 h-full w-1 bg-border" />
              <div className="text-sm text-muted mb-2">Last Device Communication</div>
              <div className="mono text-lg font-semibold text-text">
                <LastUpdated isoString={telemetry.updatedAt} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
