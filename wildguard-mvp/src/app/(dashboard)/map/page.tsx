"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  useActiveHazards,
  useCorridors,
  useDevices,
  useTrucks,
  useZones,
} from "@/hooks/useDomainData";
import { CorridorStatusBadge } from "@/components/ui/StatusBadge";

const CesiumMap = dynamic(
  () => import("@/components/map/CesiumMap").then((m) => m.CesiumMap),
  { ssr: false, loading: () => <MapLoading /> }
);
const CorridorEntity = dynamic(
  () => import("@/components/map/CorridorEntity").then((m) => m.CorridorEntity),
  { ssr: false }
);
const ZoneEntity = dynamic(
  () => import("@/components/map/ZoneEntity").then((m) => m.ZoneEntity),
  { ssr: false }
);
const SensorEntity = dynamic(
  () => import("@/components/map/SensorEntity").then((m) => m.SensorEntity),
  { ssr: false }
);
const HazardEntity = dynamic(
  () => import("@/components/map/HazardEntity").then((m) => m.HazardEntity),
  { ssr: false }
);
const TruckEntity = dynamic(
  () => import("@/components/map/TruckEntity").then((m) => m.TruckEntity),
  { ssr: false }
);

function MapLoading() {
  return (
    <div className="flex h-[70vh] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
      Loading 3D corridor map…
    </div>
  );
}

export default function CorridorMapPage() {
  const { profile } = useAuth();
  const { data: corridors } = useCorridors();
  const { data: zones } = useZones();
  const { data: devices } = useDevices();
  const { data: hazards } = useActiveHazards();
  const { data: trucks } = useTrucks(
    profile?.role === "logistics" ? profile.companyId : undefined
  );
  const [selected, setSelected] = useState<string | null>(null);

  const corridorById = useMemo(
    () => Object.fromEntries(corridors.map((c) => [c.id, c])),
    [corridors]
  );
  const deviceById = useMemo(
    () => Object.fromEntries(devices.map((d) => [d.id, d])),
    [devices]
  );
  const hazardDeviceIds = useMemo(
    () => new Set(hazards.filter((h) => h.status !== "CLEARED").map((h) => h.deviceId)),
    [hazards]
  );

  const selectedInfo = useMemo(() => {
    if (!selected) return null;
    return (
      corridors.find((c) => c.id === selected) ??
      zones.find((z) => z.id === selected) ??
      devices.find((d) => d.id === selected) ??
      trucks.find((t) => t.id === selected)
    );
  }, [selected, corridors, zones, devices, trucks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Corridor Map</h1>
          <p className="text-sm text-slate-500">
            Live spatial view of corridors, wildlife-sensitive zones, sensors,
            hazards and trucks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {corridors.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs">
              <span className="font-medium text-slate-700">{c.name.split("—")[0].trim()}</span>
              <CorridorStatusBadge state={c.state} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <CesiumMap onSelect={() => {}}>
          {corridors.map((c) => (
            <CorridorEntity key={c.id} corridor={c} onSelect={() => setSelected(c.id)} />
          ))}
          {zones.map((z) => (
            <ZoneEntity
              key={z.id}
              zone={z}
              corridorState={corridorById[z.corridorId]?.state ?? "NORMAL"}
              onSelect={() => setSelected(z.id)}
            />
          ))}
          {devices.map((d) => (
            <SensorEntity
              key={d.id}
              device={d}
              hasActiveHazard={hazardDeviceIds.has(d.id)}
              onSelect={() => setSelected(d.id)}
            />
          ))}
          {hazards
            .filter((h) => h.status !== "CLEARED")
            .map((h) => (
              <HazardEntity
                key={h.id}
                hazard={h}
                device={deviceById[h.deviceId]}
                onSelect={() => setSelected(h.deviceId)}
              />
            ))}
          {trucks.map((t) => (
            <TruckEntity key={t.id} truck={t} onSelect={() => setSelected(t.id)} />
          ))}
        </CesiumMap>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Selection
          </p>
          {selectedInfo ? (
            <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-700">
              {JSON.stringify(selectedInfo, null, 2)}
            </pre>
          ) : (
            <p className="mt-2 text-xs text-slate-400">
              Click a corridor, zone, sensor, hazard or truck on the map.
            </p>
          )}

          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <Legend color="bg-emerald-700" label="Normal" />
            <Legend color="bg-amber-600" label="Potential hazard / monitoring" />
            <Legend color="bg-red-700" label="Active hazard / intervention" />
            <Legend color="bg-sky-700" label="Sensor / device" />
            <Legend color="bg-amber-400" label="Truck" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </div>
  );
}
