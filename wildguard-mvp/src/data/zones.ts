import { DEVICE_ID } from "@/lib/config";

/**
 * Wildlife crossing zone records.
 *
 * These are demo/configuration records for the prototype, NOT real
 * reserve geography or geofencing data. `deviceId` is the only link
 * between a zone and a physical unit — a zone with no matching device
 * simply shows as having no telemetry, rather than being seeded with
 * fake readings.
 *
 * Real coordinates, reserve names, and geofencing can be added to this
 * shape later without touching how zones are consumed elsewhere.
 */
export interface CrossingZone {
  id: string;
  name: string;
  deviceId: string;
  isDemo: true;
}

export const CROSSING_ZONES: CrossingZone[] = [
  {
    id: "zone-01",
    name: "Wildlife Crossing Zone 01",
    deviceId: DEVICE_ID,
    isDemo: true,
  },
  {
    id: "zone-02",
    name: "Wildlife Crossing Zone 02",
    deviceId: "ecowildguard-002",
    isDemo: true,
  },
];
