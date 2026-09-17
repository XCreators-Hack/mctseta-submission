"use client";

import * as Cesium from "cesium";
import { Entity, PointGraphics, LabelGraphics } from "resium";
import type { Device } from "@/types";

export function SensorEntity({
  device,
  hasActiveHazard,
  onSelect,
}: {
  device: Device;
  hasActiveHazard: boolean;
  onSelect?: () => void;
}) {
  const position = Cesium.Cartesian3.fromDegrees(device.position.lng, device.position.lat, 5);
  const color = hasActiveHazard
    ? Cesium.Color.fromCssColorString("#a3271f")
    : Cesium.Color.fromCssColorString("#205a7a");

  return (
    <Entity
      position={position}
      name={device.deviceCode}
      description={`Status: ${device.status}`}
      onClick={onSelect}
    >
      <PointGraphics
        pixelSize={hasActiveHazard ? 16 : 12}
        color={color}
        outlineColor={Cesium.Color.WHITE}
        outlineWidth={2}
      />
      <LabelGraphics
        text={device.deviceCode}
        font="12px IBM Plex Mono, monospace"
        pixelOffset={new Cesium.Cartesian2(0, -20)}
        fillColor={Cesium.Color.WHITE}
        showBackground
        backgroundColor={Cesium.Color.fromCssColorString("#1c2024").withAlpha(0.75)}
      />
    </Entity>
  );
}
