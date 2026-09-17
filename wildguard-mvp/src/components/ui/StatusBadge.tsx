import clsx from "clsx";
import type { CorridorState } from "@/types";
import { CORRIDOR_STATE_PROFILES } from "@/lib/stateMachine/corridorState";

const COLOR_MAP: Record<"green" | "yellow" | "red", string> = {
  green: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  yellow: "bg-amber-50 text-amber-800 ring-amber-600/30",
  red: "bg-red-50 text-red-800 ring-red-600/30",
};

export function CorridorStatusBadge({ state }: { state: CorridorState }) {
  const profile = CORRIDOR_STATE_PROFILES[state];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        COLOR_MAP[profile.mapColor]
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          "bg-emerald-600": profile.mapColor === "green",
          "bg-amber-600": profile.mapColor === "yellow",
          "bg-red-600": profile.mapColor === "red",
        })}
      />
      {profile.label}
    </span>
  );
}

export function DeviceStatusBadge({ status }: { status: "online" | "offline" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        status === "online"
          ? "bg-sky-50 text-sky-800 ring-sky-600/20"
          : "bg-slate-100 text-slate-600 ring-slate-400/30"
      )}
    >
      <span
        className={clsx("h-1.5 w-1.5 rounded-full", {
          "bg-sky-600": status === "online",
          "bg-slate-400": status === "offline",
        })}
      />
      {status === "online" ? "Online" : "Offline"}
    </span>
  );
}
