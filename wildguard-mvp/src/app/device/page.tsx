"use client";

import { useTelemetry, isTelemetryFresh } from "@/lib/useTelemetry";
import { DEVICE_ID, DEVICE_NAME, STALE_THRESHOLD_MS } from "@/lib/config";
import { CROSSING_ZONES } from "@/data/zones";
import { controlModeLabel, detectionLabel, gateStateLabel } from "@/lib/format";
import ConnectionStatus from "@/components/ConnectionStatus";
import LastUpdated from "@/components/LastUpdated";
import CopyableValue from "@/components/CopyableValue";
import InfoRow from "@/components/InfoRow";
import SpecPanel from "@/components/SpecPanel";

export default function DevicePage() {
  const { telemetry, connectionState } = useTelemetry(DEVICE_ID);

  const apiReachable = connectionState === "online" || connectionState === "no_telemetry";
  const isFresh = telemetry ? isTelemetryFresh(telemetry.updatedAt, STALE_THRESHOLD_MS) : false;
  const isOnline = connectionState === "online" && isFresh;
  const zone = CROSSING_ZONES.find((z) => z.deviceId === DEVICE_ID);

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <SpecPanel title="Identity">
        <InfoRow label="Device name" value={DEVICE_NAME} />
        <InfoRow label="Device ID" value={<CopyableValue value={DEVICE_ID} />} />
        <InfoRow label="Controller" value="ESP32" />
        <InfoRow label="Sensors" value="Ultrasonic distance, boom-gate servo, buzzer, LCD" />
        <InfoRow label="Assigned zone" value={zone ? zone.name : "Unassigned"} />
      </SpecPanel>

      <SpecPanel title="Connectivity">
        <InfoRow label="Connection" value="Wi-Fi" />
        <InfoRow
          label="API reachable"
          value={
            <ConnectionStatus
              online={apiReachable}
              label={connectionState === "connecting" ? "Checking" : apiReachable ? "Yes" : "No"}
            />
          }
        />
        <InfoRow label="Last communication" value={<LastUpdated isoString={telemetry?.updatedAt ?? null} />} />
        <InfoRow
          label="Device state"
          value={<ConnectionStatus online={isOnline} label={isOnline ? "Online" : "Offline"} />}
        />
      </SpecPanel>

      {telemetry && (
        <SpecPanel title="Current reading">
          <InfoRow label="Detection" value={detectionLabel(telemetry.status)} />
          <InfoRow label="Sensor distance" value={`${telemetry.distance.toFixed(1)} cm`} />
          <InfoRow label="Boom gate" value={gateStateLabel(telemetry.gateState)} />
          <InfoRow label="Control mode" value={controlModeLabel(telemetry.controlMode)} />
        </SpecPanel>
      )}
    </div>
  );
}
