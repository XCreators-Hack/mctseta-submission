import type { Telemetry } from "@/lib/types";

interface BoomGateCardProps {
  telemetry: Telemetry | null;
  isOnline: boolean;
}

/**
 * Boom-gate status card — read-only.
 *
 * This is a monitoring prototype: the frontend only displays what the
 * ESP32 reports (gateState, controlMode). It never sends commands back
 * to the device.
 */
export default function BoomGateCard({ telemetry, isOnline }: BoomGateCardProps) {
  const gateOpen = telemetry?.gateState === "open";
  const manualOverride = telemetry?.controlMode === "manual_override";

  return (
    <div className="rounded border border-border bg-surface p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted">Boom Gate</div>
        {manualOverride && <span className="text-xs font-medium text-accent">Manual override active</span>}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative w-20 h-16 shrink-0" aria-hidden="true">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-14 rounded-sm bg-border" />
          <div
            className={[
              "absolute bottom-[52px] left-1/2 h-1.5 w-16 origin-left rounded-sm transition-transform duration-500",
              gateOpen ? "-rotate-[70deg]" : "rotate-0",
              telemetry ? (gateOpen ? "bg-safe" : "bg-danger") : "bg-muted",
            ].join(" ")}
          />
        </div>

        <div>
          <div
            className={[
              "text-2xl font-semibold mono",
              telemetry ? (gateOpen ? "text-safe" : "text-danger") : "text-muted",
            ].join(" ")}
          >
            {telemetry ? (gateOpen ? "OPEN" : "CLOSED") : "—"}
          </div>
          <div className="text-xs text-muted mt-1">
            Mode:{" "}
            <span className="text-text">
              {telemetry ? (manualOverride ? "MANUAL OVERRIDE" : "AUTOMATIC") : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted">
        {!isOnline
          ? "Device offline — gate state unknown until telemetry resumes."
          : "Status reported by the device. This prototype does not send gate commands."}
      </div>
    </div>
  );
}
