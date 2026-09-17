"use client";

import { useMemo, type ReactNode } from "react";
import {
  Viewer,
  Entity,
  PolygonGraphics,
  PolylineGraphics,
  BillboardGraphics,
  PointGraphics,
  LabelGraphics,
  CameraFlyTo,
} from "resium";
import * as Cesium from "cesium";

// Cesium expects its static assets (Workers, Widgets CSS, etc.) at this
// base URL — copied into /public/cesium by scripts/copy-cesium-assets.js.
if (typeof window !== "undefined") {
  (window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL = "/cesium/";
  if (process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN) {
    Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
  }
}

export interface SelectedObject {
  kind: "sensor" | "hazard" | "truck" | "zone";
  id: string;
}

interface CesiumMapProps {
  children?: ReactNode;
  onSelect?: (obj: SelectedObject | null) => void;
  flyTo?: { lat: number; lng: number; height?: number };
  className?: string;
}

export function CesiumMap({ children, onSelect, flyTo, className }: CesiumMapProps) {
  void onSelect;

  const destination = useMemo(() => {
    if (!flyTo) {
      // Default view: Mpumalanga lowveld corridor region.
      return Cesium.Cartesian3.fromDegrees(31.03, -25.15, 45000);
    }
    return Cesium.Cartesian3.fromDegrees(flyTo.lng, flyTo.lat, flyTo.height ?? 8000);
  }, [flyTo]);

  return (
    <div className={className ?? "h-[70vh] w-full overflow-hidden rounded-lg border border-slate-200"}>
      <Viewer
        full
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        sceneModePicker={false}
        navigationHelpButton={false}
        infoBox={false}
        selectionIndicator={false}
        // Selection is handled per-entity via each Entity's onClick prop
        // rather than viewer-level tracking, keeping ownership local to
        // each entity component.
      >
        <CameraFlyTo destination={destination} duration={2} />
        {children}
      </Viewer>
    </div>
  );
}

export { Entity, PolygonGraphics, PolylineGraphics, BillboardGraphics, PointGraphics, LabelGraphics, Cesium };
