"use client";

import { useState } from "react";
import clsx from "clsx";
import { useDevices } from "@/hooks/useDomainData";

const SCENARIOS = [
  { id: "NORMAL", label: "Reset to normal" },
  { id: "HAZARD_DETECTED", label: "Simulate hazard detected" },
  { id: "WARNING_ACTIVE", label: "Escalate to warning" },
  { id: "INTERVENTION_ACTIVE", label: "Escalate to intervention" },
  { id: "CLEARANCE", label: "Clear hazard" },
] as const;

export function DemoModePanel() {
  const { data: devices } = useDevices();
  const [deviceId, setDeviceId] = useState(devices[0]?.id ?? "");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeDevice = deviceId || devices[0]?.id || "";

  async function trigger(scenario: string) {
    if (!activeDevice) return;
    setPending(scenario);
    setMessage(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: activeDevice, scenario }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Simulation failed");
      }
      setMessage(`Simulated ${scenario.replace("_", " ").toLowerCase()} sent.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-amber-900">Demo Mode</p>
        <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-900">
          Simulated data
        </span>
      </div>
      <p className="mt-1 text-xs text-amber-800">
        Trigger a simulated sensor event exactly as the physical ESP32 would
        send it. Every dashboard, the corridor map and the alerts feed will
        update in real time.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={activeDevice}
          onChange={(e) => setDeviceId(e.target.value)}
          className="rounded-md border border-amber-300 bg-white px-2 py-1.5 text-xs"
        >
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.deviceCode}
            </option>
          ))}
        </select>

        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => trigger(s.id)}
            disabled={pending !== null || !activeDevice}
            className={clsx(
              "rounded-md px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
              s.id === "HAZARD_DETECTED" || s.id === "INTERVENTION_ACTIVE"
                ? "bg-red-700 text-white hover:bg-red-800"
                : "bg-slate-800 text-white hover:bg-slate-900",
              pending !== null && "opacity-60"
            )}
          >
            {pending === s.id ? "Sending…" : s.label}
          </button>
        ))}
      </div>

      {message && <p className="mt-2 text-xs text-amber-900">{message}</p>}
    </div>
  );
}
