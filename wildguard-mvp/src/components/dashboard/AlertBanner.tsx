"use client";

import clsx from "clsx";
import type { Hazard, Zone } from "@/types";

export function AlertBanner({
  hazard,
  zone,
  onAcknowledge,
  acknowledged,
}: {
  hazard: Hazard;
  zone?: Zone;
  onAcknowledge?: () => void;
  acknowledged?: boolean;
}) {
  const critical = hazard.status === "ACTIVE";

  return (
    <div
      className={clsx(
        "rounded-lg border-l-4 p-4 shadow-sm",
        critical
          ? "border-red-600 bg-red-50"
          : "border-amber-500 bg-amber-50"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className={clsx(
              "text-sm font-semibold",
              critical ? "text-red-800" : "text-amber-800"
            )}
          >
            {critical ? "Active hazard" : "Hazard acknowledged"} — {zone?.name ?? hazard.zoneId}
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Distance {hazard.distanceCm} cm · Device {hazard.deviceId}
          </p>
        </div>
        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            disabled={acknowledged}
            className={clsx(
              "rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors",
              acknowledged
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            {acknowledged ? "Acknowledged" : "Acknowledge"}
          </button>
        )}
      </div>
    </div>
  );
}
