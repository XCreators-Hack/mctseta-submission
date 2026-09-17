"use client";

import * as Cesium from "cesium";
import { Entity, PointGraphics } from "resium";
import type { Device, Hazard } from "@/types";

export function HazardEntity({
  hazard,
  device,
  onSelect,
}: {
  hazard: Hazard;
  device?: Device;
  onSelect?: () => void;
}) {
  if (!device) return null;
  const position = Cesium.Cartesian3.fromDegrees(device.position.lng, device.position.lat, 5);

  return (
    <Entity
      position={position}
      name={`Hazard — ${device.deviceCode}`}
      description={`Distance ${hazard.distanceCm} cm · Status ${hazard.status}`}
      onClick={onSelect}
    >
      <PointGraphics
        pixelSize={28}
        color={Cesium.Color.fromCssColorString("#a3271f").withAlpha(0.35)}
        outlineColor={Cesium.Color.fromCssColorString("#a3271f")}
        outlineWidth={3}
      />
    </Entity>
  );
}
