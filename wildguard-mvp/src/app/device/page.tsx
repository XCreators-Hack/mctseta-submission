"use client";

import { useTelemetry, isTelemetryFresh } from "@/lib/useTelemetry";
import { DEVICE_ID, DEVICE_NAME, STALE_THRESHOLD_MS } from "@/lib/config";
import ConnectionStatus from "@/components/ConnectionStatus";
import LastUpdated from "@/components/LastUpdated";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm text-text mono">{value}</span>
    </div>
  );
}

export default function DevicePage() {
  const { telemetry, connectionState } = useTelemetry(DEVICE_ID);

  const isFresh = telemetry ? isTelemetryFresh(telemetry.updatedAt, STALE_THRESHOLD_MS) : false;
  const isOnline = connectionState === "online" && isFresh;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-sm font-medium text-text">Device</h2>

      <div className="rounded border border-border bg-surface px-4">
        <InfoRow label="Device Name" value={DEVICE_NAME} />
        <InfoRow label="Device ID" value={DEVICE_ID} />
        <InfoRow label="Controller" value="ESP32" />
        <InfoRow label="Connection" value="Wi-Fi" />
        <InfoRow label="API Status" value={<ConnectionStatus online={connectionState === "online"} />} />
        <InfoRow label="Last Communication" value={<LastUpdated isoString={telemetry?.updatedAt ?? null} />} />
        <InfoRow label="Device State" value={<ConnectionStatus online={isOnline} />} />
      </div>
    </div>
  );
}
