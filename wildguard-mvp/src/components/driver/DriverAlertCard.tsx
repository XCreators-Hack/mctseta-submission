"use client";

import clsx from "clsx";
import type { Hazard, Zone } from "@/types";
import { CORRIDOR_STATE_PROFILES } from "@/lib/stateMachine/corridorState";
import type { CorridorState } from "@/types";

export function DriverAlertCard({
  hazard,
  zone,
  corridorState,
  distanceToZoneM,
  onAcknowledge,
  acknowledged,
}: {
  hazard: Hazard;
  zone?: Zone;
  corridorState: CorridorState;
  distanceToZoneM?: number;
  onAcknowledge: () => void;
  acknowledged: boolean;
}) {
  const profile = CORRIDOR_STATE_PROFILES[corridorState];
  const critical = profile.mapColor === "red";

  return (
    <div
      className={clsx(
        "rounded-xl border-2 p-6 text-center shadow-lg",
        critical ? "border-red-700 bg-red-50" : "border-amber-500 bg-amber-50"
      )}
    >
      <p
        className={clsx(
          "text-sm font-bold tracking-wide",
          critical ? "text-red-800" : "text-amber-800"
        )}
      >
        WILDLIFE / ROAD HAZARD
      </p>
      <p className="text-lg font-semibold text-slate-800">{zone?.name ?? hazard.zoneId}</p>

      <div className="my-4">
        <p className="text-xs font-medium uppercase text-slate-500">Reduce speed</p>
        <p className={clsx("text-5xl font-bold", critical ? "text-red-700" : "text-amber-700")}>
          {profile.speedLimitKmh} <span className="text-2xl font-medium">km/h</span>
        </p>
      </div>

      {distanceToZoneM !== undefined && (
        <p className="text-sm text-slate-600">
          Distance: <span className="font-semibold">{distanceToZoneM} m</span>
        </p>
      )}

      <button
        onClick={onAcknowledge}
        disabled={acknowledged}
        className={clsx(
          "mt-5 w-full rounded-lg py-3 text-base font-bold shadow-sm transition-colors",
          acknowledged
            ? "cursor-not-allowed bg-slate-200 text-slate-500"
            : "bg-slate-900 text-white active:bg-slate-800"
        )}
      >
        {acknowledged ? "ALERT ACKNOWLEDGED" : "ACKNOWLEDGE ALERT"}
      </button>
    </div>
  );
}
