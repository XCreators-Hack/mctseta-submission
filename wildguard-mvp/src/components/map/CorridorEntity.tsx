"use client";

import * as Cesium from "cesium";
import { Entity, PolylineGraphics } from "resium";
import type { Corridor } from "@/types";
import { CORRIDOR_STATE_PROFILES } from "@/lib/stateMachine/corridorState";

const LINE_COLOR: Record<"green" | "yellow" | "red", Cesium.Color> = {
  green: Cesium.Color.fromCssColorString("#1f4d3a"),
  yellow: Cesium.Color.fromCssColorString("#c17817"),
  red: Cesium.Color.fromCssColorString("#a3271f"),
};

export function CorridorEntity({ corridor, onSelect }: { corridor: Corridor; onSelect?: () => void }) {
  const positions = Cesium.Cartesian3.fromDegreesArray(
    corridor.geometryPath.flatMap((p) => [p.lng, p.lat])
  );
  const color = LINE_COLOR[CORRIDOR_STATE_PROFILES[corridor.state].mapColor];

  return (
    <Entity name={corridor.name} description={`State: ${corridor.state}`} onClick={onSelect}>
      <PolylineGraphics positions={positions} width={6} material={color} clampToGround />
    </Entity>
  );
}
