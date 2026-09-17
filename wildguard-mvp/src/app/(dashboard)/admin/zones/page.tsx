"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useZones, useCorridors } from "@/hooks/useDomainData";
import clsx from "clsx";

function ZoneManagement() {
  const { data: zones } = useZones();
  const { data: corridors } = useCorridors();
  const corridorName = (id: string) => corridors.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Zone management</h1>
        <p className="text-sm text-slate-500">
          Wildlife-sensitive sub-areas within monitored corridors.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {zones.map((z) => (
          <div key={z.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-slate-800">{z.name}</h2>
              <span
                className={clsx(
                  "rounded-md px-2 py-0.5 text-xs font-medium",
                  z.riskLevel === "high" && "bg-red-50 text-red-700",
                  z.riskLevel === "medium" && "bg-amber-50 text-amber-700",
                  z.riskLevel === "low" && "bg-slate-100 text-slate-600"
                )}
              >
                {z.riskLevel} risk
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Corridor: {corridorName(z.corridorId)}</p>
            <p className="mt-1 text-xs text-slate-500">{z.boundary.length}-point boundary</p>
            <p className="mt-3 text-xs font-medium text-slate-600">Notes</p>
            {z.notes.length === 0 ? (
              <p className="text-xs text-slate-400">No notes yet.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-xs text-slate-600">
                {z.notes.map((n, i) => (
                  <li key={i}>
                    <span className="font-medium">{n.authorName}:</span> {n.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default withRoleGuard(ZoneManagement, ["admin", "wildlife"]);
