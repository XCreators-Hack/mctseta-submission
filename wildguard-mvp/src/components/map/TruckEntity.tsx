"use client";

import * as Cesium from "cesium";
import { Entity, PointGraphics, LabelGraphics } from "resium";
import type { Truck } from "@/types";

export function TruckEntity({ truck, onSelect }: { truck: Truck; onSelect?: () => void }) {
  const position = Cesium.Cartesian3.fromDegrees(
    truck.currentPosition.lng,
    truck.currentPosition.lat,
    5
  );

  return (
    <Entity
      position={position}
      name={truck.plateNumber}
      description={`${truck.model} · Status: ${truck.status}`}
      onClick={onSelect}
    >
      <PointGraphics
        pixelSize={14}
        color={Cesium.Color.fromCssColorString("#e2b13c")}
        outlineColor={Cesium.Color.fromCssColorString("#1c2024")}
        outlineWidth={2}
      />
      <LabelGraphics
        text={truck.plateNumber}
        font="11px IBM Plex Mono, monospace"
        pixelOffset={new Cesium.Cartesian2(0, 18)}
        fillColor={Cesium.Color.fromCssColorString("#1c2024")}
        showBackground
        backgroundColor={Cesium.Color.WHITE.withAlpha(0.8)}
      />
    </Entity>
  );
}
