"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { StatCard } from "@/components/dashboard/StatCard";
import { EventFeed } from "@/components/dashboard/EventFeed";
import { DemoModePanel } from "@/components/dashboard/DemoModePanel";
import {
  useActiveHazards,
  useCorridors,
  useDevices,
  useEvents,
  useTrucks,
} from "@/hooks/useDomainData";

function AdminOverview() {
  const { data: devices } = useDevices();
  const { data: corridors } = useCorridors();
  const { data: hazards } = useActiveHazards();
  const { data: trucks } = useTrucks();
  const { data: events } = useEvents(20);

  const online = devices.filter((d) => d.status === "online").length;
  const active = hazards.filter((h) => h.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">System overview</h1>
        <p className="text-sm text-slate-500">
          Wide-angle view of every sensor, corridor, hazard and truck on the network.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active sensors" value={`${online}/${devices.length}`} hint="Online / total" />
        <StatCard
          label="Active hazards"
          value={active}
          tone={active > 0 ? "critical" : "good"}
        />
        <StatCard label="Corridor zones" value={corridors.length} />
        <StatCard label="Trucks monitored" value={trucks.length} />
      </div>

      <DemoModePanel />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Recent events</h2>
          <EventFeed events={events} />
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-800">Corridor status</h2>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {corridors.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium text-slate-700">{c.name}</span>
                <span className="text-xs text-slate-500">{c.state.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withRoleGuard(AdminOverview, ["admin"]);
