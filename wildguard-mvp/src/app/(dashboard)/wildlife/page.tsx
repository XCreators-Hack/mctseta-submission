"use client";

import { useState } from "react";
import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  useActiveHazards,
  useDevices,
  useZones,
} from "@/hooks/useDomainData";
import { formatDistanceToNow } from "date-fns";

function WildlifeDashboard() {
  const { firebaseUser } = useAuth();
  const { data: hazards } = useActiveHazards();
  const { data: devices } = useDevices();
  const { data: zones } = useZones();
  const [ackIds, setAckIds] = useState<string[]>([]);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  async function acknowledge(id: string) {
    setAckIds((ids) => [...ids, id]);
    const token = await firebaseUser?.getIdToken();
    await fetch(`/api/hazards/${id}/ack`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Wildlife management</h1>
        <p className="text-sm text-slate-500">
          Monitor wildlife-sensitive zones and coordinate incident responses.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active incidents" value={hazards.filter((h) => h.status !== "CLEARED").length} tone="critical" />
        <StatCard label="High-risk zones" value={zones.filter((z) => z.riskLevel === "high").length} />
        <StatCard label="Sensors monitored" value={devices.length} />
        <StatCard label="Zones tracked" value={zones.length} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Active incidents</h2>
        {hazards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No active wildlife incidents. Trigger Demo Mode from the Admin dashboard to see this flow.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {hazards.map((h) => {
              const zone = zones.find((z) => z.id === h.zoneId);
              const device = devices.find((d) => d.id === h.deviceId);
              return (
                <div key={h.id} className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-bold text-red-800">WILDLIFE ACTIVITY DETECTED</p>
                  <dl className="mt-2 space-y-1 text-xs text-slate-700">
                    <Row label="Zone" value={zone?.name ?? h.zoneId} />
                    <Row label="Sensor" value={device?.deviceCode ?? h.deviceId} />
                    <Row label="Time" value={safeRelative(h.createdAt)} />
                    <Row label="Distance" value={`${h.distanceCm} cm`} />
                    <Row label="Status" value={h.status} />
                  </dl>
                  <div className="mt-3 flex flex-col gap-2">
                    <textarea
                      value={noteDrafts[h.id] ?? ""}
                      onChange={(e) => setNoteDrafts((d) => ({ ...d, [h.id]: e.target.value }))}
                      rows={2}
                      placeholder="Add a note about this incident…"
                      className="w-full rounded-md border border-red-200 bg-white px-2 py-1.5 text-xs"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => acknowledge(h.id)}
                        disabled={ackIds.includes(h.id)}
                        className="flex-1 rounded-md bg-slate-900 py-2 text-xs font-semibold text-white disabled:bg-slate-300"
                      >
                        {ackIds.includes(h.id) ? "Acknowledged" : "Acknowledge"}
                      </button>
                      <button className="flex-1 rounded-md border border-red-300 bg-white py-2 text-xs font-semibold text-red-700">
                        Add note
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function safeRelative(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "—";
  }
}

export default withRoleGuard(WildlifeDashboard, ["wildlife"]);
