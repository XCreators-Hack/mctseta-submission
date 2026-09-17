"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventFeed } from "@/components/dashboard/EventFeed";
import {
  useActiveHazards,
  useCorridors,
  useEvents,
  useTrucks,
} from "@/hooks/useDomainData";
import { CorridorStatusBadge } from "@/components/ui/StatusBadge";

function LogisticsOverview() {
  const { profile } = useAuth();
  const { data: trucks } = useTrucks(profile?.companyId);
  const { data: corridors } = useCorridors();
  const { data: hazards } = useActiveHazards();
  const { data: events } = useEvents(20);

  const myRouteIds = new Set(trucks.map((t) => t.currentRouteId).filter(Boolean));
  const relevantCorridors = corridors.filter((c) => myRouteIds.has(c.id));
  const relevantHazards = hazards.filter((h) => myRouteIds.has(h.corridorId));
  const relevantEvents = events.filter((e) => myRouteIds.has(e.corridorId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Fleet overview</h1>
        <p className="text-sm text-slate-500">
          Your trucks, routes and any hazards affecting them.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active trucks" value={trucks.filter((t) => t.status === "active").length} />
        <StatCard label="Total trucks" value={trucks.length} />
        <StatCard
          label="Hazards on routes"
          value={relevantHazards.length}
          tone={relevantHazards.length > 0 ? "critical" : "good"}
        />
        <StatCard label="Corridors used" value={relevantCorridors.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Your trucks</h2>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {trucks.map((t) => {
              const corridor = corridors.find((c) => c.id === t.currentRouteId);
              return (
                <li key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{t.plateNumber}</p>
                    <p className="text-xs text-slate-500">{t.model}</p>
                  </div>
                  {corridor && <CorridorStatusBadge state={corridor.state} />}
                </li>
              );
            })}
            {trucks.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-slate-400">
                No trucks registered yet.
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Route events</h2>
          <EventFeed events={relevantEvents} />
        </div>
      </div>
    </div>
  );
}

export default withRoleGuard(LogisticsOverview, ["logistics"]);
