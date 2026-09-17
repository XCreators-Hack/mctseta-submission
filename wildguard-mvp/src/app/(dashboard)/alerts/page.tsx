"use client";

import { useState } from "react";
import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAlertsForRole, useActiveHazards, useZones } from "@/hooks/useDomainData";
import { AlertBanner } from "@/components/dashboard/AlertBanner";

function AlertsPage() {
  const { profile, firebaseUser } = useAuth();
  const { data: alerts } = useAlertsForRole(profile?.role);
  const { data: hazards } = useActiveHazards();
  const { data: zones } = useZones();
  const [ackIds, setAckIds] = useState<string[]>([]);

  async function acknowledge(hazardId: string) {
    setAckIds((ids) => [...ids, hazardId]);
    const token = await firebaseUser?.getIdToken();
    await fetch(`/api/hazards/${hazardId}/ack`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Alerts</h1>
        <p className="text-sm text-slate-500">Alerts relevant to your role, most recent first.</p>
      </div>

      {alerts.length === 0 && hazards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No alerts right now.
        </div>
      ) : (
        <div className="space-y-3">
          {hazards.map((h) => (
            <AlertBanner
              key={h.id}
              hazard={h}
              zone={zones.find((z) => z.id === h.zoneId)}
              onAcknowledge={() => acknowledge(h.id)}
              acknowledged={ackIds.includes(h.id) || h.acknowledgedBy.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default withRoleGuard(AlertsPage, ["admin", "driver", "logistics", "wildlife"]);
