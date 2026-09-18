"use client";

import { useTelemetry, isTelemetryFresh } from "@/lib/useTelemetry";
import { DEVICE_ID, STALE_THRESHOLD_MS } from "@/lib/config";
import DeviceStatus from "@/components/DeviceStatus";
import DistanceHero from "@/components/DistanceHero";
import StatePanel from "@/components/StatePanel";

export default function DashboardPage() {
  const { telemetry, connectionState, errorMessage } = useTelemetry(DEVICE_ID);

  const isFresh = telemetry ? isTelemetryFresh(telemetry.updatedAt, STALE_THRESHOLD_MS) : false;
  const isOnline = connectionState === "online" && isFresh;

  return (
    <div className="flex flex-col gap-4 max-w-4xl">
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

      {connectionState === "online" && telemetry && (
        <DistanceHero distance={telemetry.distance} status={telemetry.status} />
      )}
    </div>
  );
}
