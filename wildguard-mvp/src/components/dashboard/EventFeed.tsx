import clsx from "clsx";
import type { WildGuardEvent } from "@/types";
import { formatDistanceToNow } from "date-fns";

export function EventFeed({
  events,
  emptyLabel = "No events yet. Trigger Demo Mode to see the flow in action.",
}: {
  events: WildGuardEvent[];
  emptyLabel?: string;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {events.map((event) => (
        <li key={event.id} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span
            className={clsx("h-2 w-2 shrink-0 rounded-full", {
              "bg-red-500": event.eventType === "HAZARD_DETECTED",
              "bg-emerald-500": event.eventType === "CLEARANCE",
              "bg-sky-500": event.eventType === "MANUAL_REPORT",
            })}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-800">
              {event.eventType.replace("_", " ")} — {event.deviceId}
            </p>
            <p className="text-xs text-slate-500">
              Zone {event.zoneId} · {event.distance} cm ·{" "}
              <span
                className={clsx(
                  event.source === "demo" && "font-medium text-amber-600"
                )}
              >
                {event.source === "demo" ? "Demo Mode" : event.source}
              </span>
            </p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">
            {safeRelativeTime(event.timestamp)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function safeRelativeTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}
