"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CROSSING_ZONES } from "@/data/zones";
import { detectionLabel } from "@/lib/format";
import ZoneCard from "@/components/ZoneCard";
import BoomGateCard from "@/components/BoomGateCard";
import AlertsPanel, { type Alert } from "@/components/AlertsPanel";
import type { Telemetry } from "@/lib/types";

interface ZoneState {
  telemetry: Telemetry | null;
  isOnline: boolean;
}

/**
 * Ranger-facing view: every crossing zone at a glance, with warnings
 * surfaced at the top so a ranger can immediately see which zone needs
 * attention, plus gate control on each zone that has a reporting unit.
 */
export default function OperationsPage() {
  // Each ZoneCard polls its own zone's telemetry; this collects that
  // state here so the warnings panel can summarize across all zones.
  const [zoneStates, setZoneStates] = useState<Record<string, ZoneState>>({});

  function handleZoneState(zoneId: string, state: ZoneState) {
    setZoneStates((prev) => ({ ...prev, [zoneId]: state }));
  }

  const alerts = useMemo<Alert[]>(() => {
    const list: Alert[] = [];
    for (const zone of CROSSING_ZONES) {
      const state = zoneStates[zone.id];
      if (!state) continue;
      const { telemetry, isOnline } = state;

      if (!isOnline) {
        list.push({ id: `${zone.id}-offline`, message: `${zone.name}: unit offline`, tone: "critical" });
        continue;
      }
      if (!telemetry) continue;

      if (telemetry.status === "animal_ahead") {
        list.push({
          id: `${zone.id}-ahead`,
          message: `${zone.name}: ${detectionLabel(telemetry.status)}`,
          tone: "critical",
        });
      } else if (telemetry.status === "animal_crossing") {
        list.push({
          id: `${zone.id}-crossing`,
          message: `${zone.name}: ${detectionLabel(telemetry.status)}`,
          tone: "caution",
        });
      }
      if (telemetry.controlMode === "manual_override") {
        list.push({
          id: `${zone.id}-override`,
          message: `${zone.name}: boom gate under manual override`,
          tone: "caution",
        });
      }
    }
    return list;
  }, [zoneStates]);

  return (
    <div className="flex flex-col gap-4 max-w-5xl">
      <AlertsPanel title="Warnings Requiring Attention" alerts={alerts} />

      <div className="grid gap-4 md:grid-cols-2">
        {CROSSING_ZONES.map((zone) => (
          <ZoneCard key={zone.id} zone={zone}>
            {({ telemetry, isOnline }) => (
              <ZonePanel zoneId={zone.id} telemetry={telemetry} isOnline={isOnline} onReport={handleZoneState} />
            )}
          </ZoneCard>
        ))}
      </div>
    </div>
  );
}

interface ZonePanelProps {
  zoneId: string;
  telemetry: Telemetry | null;
  isOnline: boolean;
  onReport: (zoneId: string, state: ZoneState) => void;
}

/** Reports this zone's current state to the page (for the warnings
 * summary) and renders the zone's read-only gate status. */
function ZonePanel({ zoneId, telemetry, isOnline, onReport }: ZonePanelProps) {
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    const key = JSON.stringify({ telemetry, isOnline });
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    onReport(zoneId, { telemetry, isOnline });
  }, [zoneId, telemetry, isOnline, onReport]);

  return <BoomGateCard telemetry={telemetry} isOnline={isOnline} />;
}
