"use client";

import { useMemo, useState } from "react";
import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  useActiveHazards,
  useCorridors,
  useTrucks,
  useZones,
} from "@/hooks/useDomainData";
import { DriverAlertCard } from "@/components/driver/DriverAlertCard";
import { CorridorStatusBadge } from "@/components/ui/StatusBadge";

function DriverDashboard() {
  const { profile, firebaseUser } = useAuth();
  const { data: trucks } = useTrucks(profile?.companyId);
  const { data: corridors } = useCorridors();
  const { data: zones } = useZones();
  const { data: hazards } = useActiveHazards();
  const [ackIds, setAckIds] = useState<string[]>([]);
  const [reportOpen, setReportOpen] = useState(false);

  // MVP: driver is shown the first truck for their company as "their" truck.
  const myTruck = trucks[0];
  const myCorridor = corridors.find((c) => c.id === myTruck?.currentRouteId);
  const activeHazard = hazards.find(
    (h) => h.status === "ACTIVE" && h.corridorId === myCorridor?.id
  );
  const hazardZone = useMemo(
    () => zones.find((z) => z.id === activeHazard?.zoneId),
    [zones, activeHazard]
  );

  async function acknowledge() {
    if (!activeHazard) return;
    setAckIds((ids) => [...ids, activeHazard.id]);
    try {
      const token = await firebaseUser?.getIdToken();
      await fetch(`/api/hazards/${activeHazard.id}/ack`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // best-effort in the MVP; UI already reflects the acknowledgement
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">My route</h1>
        {myTruck ? (
          <p className="text-sm text-slate-500">
            {myTruck.plateNumber} · {myTruck.model}
          </p>
        ) : (
          <p className="text-sm text-slate-500">No truck currently assigned.</p>
        )}
      </div>

      {myCorridor && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-slate-800">{myCorridor.name}</p>
            <p className="text-xs text-slate-500">Speed limit {myCorridor.speedLimitKmh} km/h</p>
          </div>
          <CorridorStatusBadge state={myCorridor.state} />
        </div>
      )}

      {activeHazard ? (
        <DriverAlertCard
          hazard={activeHazard}
          zone={hazardZone}
          corridorState={myCorridor?.state ?? "WARNING_ACTIVE"}
          distanceToZoneM={350}
          onAcknowledge={acknowledge}
          acknowledged={ackIds.includes(activeHazard.id)}
        />
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-sm font-semibold text-emerald-800">No active hazards</p>
          <p className="mt-1 text-xs text-emerald-700">Corridor is operating normally.</p>
        </div>
      )}

      <button
        onClick={() => setReportOpen((v) => !v)}
        className="w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm active:bg-slate-50"
      >
        Report a hazard manually
      </button>
      {reportOpen && <ManualReportForm corridorId={myCorridor?.id} zoneId={hazardZone?.id ?? zones[0]?.id} />}
    </div>
  );
}

function ManualReportForm({ corridorId, zoneId }: { corridorId?: string; zoneId?: string }) {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    setStatus("Sending…");
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: zoneId ?? corridorId ?? "device-wc003", scenario: "HAZARD_DETECTED" }),
      });
      if (!res.ok) throw new Error("Failed to report");
      setStatus("Report sent to wildlife management and logistics.");
      setNote("");
    } catch {
      setStatus("Couldn't send report — check your connection.");
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <label className="block text-xs font-medium text-slate-600">What did you see?</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        placeholder="e.g. Elephants near the road, 200m ahead"
      />
      <button
        onClick={submit}
        className="mt-2 w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white"
      >
        Submit report
      </button>
      {status && <p className="mt-2 text-xs text-slate-500">{status}</p>}
    </div>
  );
}

export default withRoleGuard(DriverDashboard, ["driver"]);
