"use client";

import { useState, type FormEvent } from "react";
import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTrucks } from "@/hooks/useDomainData";
import { useCollection } from "@/hooks/useCollection";
import type { Driver } from "@/types";

function FleetManagement() {
  const { profile, firebaseUser } = useAuth();
  const { data: trucks, isMock } = useTrucks(profile?.companyId);
  const { data: drivers } = useCollection<Driver>("drivers");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function addTruck(e: FormEvent) {
    e.preventDefault();
    setStatus("Adding…");
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch("/api/trucks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plateNumber: plate, model }),
      });
      if (!res.ok) throw new Error("Failed to add truck");
      setStatus("Truck added.");
      setPlate("");
      setModel("");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to add truck");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Manage fleet</h1>
        <p className="text-sm text-slate-500">Add trucks and assign drivers for your company.</p>
      </div>

      <form onSubmit={addTruck} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-medium text-slate-600">Plate number</label>
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600">Model</label>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Add truck
        </button>
        {status && <p className="text-xs text-slate-500">{status}</p>}
      </form>

      {isMock && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Showing demo fleet data — connect Firebase to manage your real fleet.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Plate</th>
              <th className="px-4 py-2.5">Model</th>
              <th className="px-4 py-2.5">Assigned driver</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trucks.map((t) => {
              const driver = drivers.find((d) => d.id === t.assignedDriverId);
              return (
                <tr key={t.id}>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{t.plateNumber}</td>
                  <td className="px-4 py-2.5 text-slate-600">{t.model}</td>
                  <td className="px-4 py-2.5 text-slate-600">{driver?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-2.5 text-slate-500">{t.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withRoleGuard(FleetManagement, ["logistics"]);
