import ConnectionStatus from "./ConnectionStatus";
import LastUpdated from "./LastUpdated";
import { DEVICE_ID, DEVICE_NAME } from "@/lib/config";

interface DeviceStatusProps {
  online: boolean;
  updatedAt: string | null;
}

export default function DeviceStatus({ online, updatedAt }: DeviceStatusProps) {
  return (
    <div className="rounded border border-border bg-surface px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm font-medium text-text">{DEVICE_NAME}</div>
        <div className="text-xs text-muted mono mt-0.5">{DEVICE_ID}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-muted">
          Last updated: <LastUpdated isoString={updatedAt} />
        </div>
        <ConnectionStatus online={online} label={online ? "Online" : "Offline"} />
      </div>
    </div>
  );
}
