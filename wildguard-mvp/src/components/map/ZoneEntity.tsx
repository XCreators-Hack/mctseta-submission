"use client";

import * as Cesium from "cesium";
import { Entity, PolygonGraphics } from "resium";
import type { Zone, CorridorState } from "@/types";
import { CORRIDOR_STATE_PROFILES } from "@/lib/stateMachine/corridorState";

const MAP_COLOR: Record<"green" | "yellow" | "red", Cesium.Color> = {
  green: Cesium.Color.fromCssColorString("#1f4d3a").withAlpha(0.35),
  yellow: Cesium.Color.fromCssColorString("#c17817").withAlpha(0.4),
  red: Cesium.Color.fromCssColorString("#a3271f").withAlpha(0.45),
};

export function ZoneEntity({
  zone,
  corridorState,
  onSelect,
}: {
  zone: Zone;
  corridorState: CorridorState;
  onSelect?: () => void;
}) {
  const positions = Cesium.Cartesian3.fromDegreesArray(
    zone.boundary.flatMap((p) => [p.lng, p.lat])
  );
  const color = MAP_COLOR[CORRIDOR_STATE_PROFILES[corridorState].mapColor];

  return (
    <Entity
      name={zone.name}
      description={`Risk level: ${zone.riskLevel}`}
      onClick={onSelect}
    >
      <PolygonGraphics
        hierarchy={new Cesium.PolygonHierarchy(positions)}
        material={color}
        outline
        outlineColor={Cesium.Color.WHITE.withAlpha(0.6)}
      />
    </Entity>
  );
}
