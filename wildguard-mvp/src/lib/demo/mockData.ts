// ---------------------------------------------------------------------------
// DEMO / MOCK DATA
// ---------------------------------------------------------------------------
// This file exists so the UI is fully browsable before Firebase is wired up
// with real credentials, and so the hackathon demo can run even if the venue
// Wi-Fi or the physical ESP32 fails. Anything sourced from here is always
// tagged with `source: "demo"` or `source: "mock"` in the UI — never
// presented as if it came from a real device. See `useX` hooks in
// `src/hooks` for how this is merged with (and superseded by) live
// Firestore data once configured.
// ---------------------------------------------------------------------------

import type {
  Corridor,
  Device,
  Hazard,
  Truck,
  WildGuardEvent,
  Zone,
  Alert,
} from "@/types";

export const MOCK_CORRIDORS: Corridor[] = [
  {
    id: "corridor-03",
    name: "N4 Corridor 03 — Crocodile River Crossing",
    geometryPath: [
      { lat: -25.4653, lng: 31.0107 },
      { lat: -25.4598, lng: 31.0244 },
      { lat: -25.4531, lng: 31.0392 },
    ],
    state: "NORMAL",
    speedLimitKmh: 80,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "corridor-07",
    name: "R538 Corridor 07 — Kruger Boundary Road",
    geometryPath: [
      { lat: -24.9926, lng: 31.5547 },
      { lat: -24.9814, lng: 31.5701 },
      { lat: -24.9702, lng: 31.5865 },
    ],
    state: "NORMAL",
    speedLimitKmh: 80,
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_ZONES: Zone[] = [
  {
    id: "zone-03",
    corridorId: "corridor-03",
    name: "Zone 03 — Elephant Crossing",
    riskLevel: "high",
    boundary: [
      { lat: -25.462, lng: 31.017 },
      { lat: -25.4605, lng: 31.0205 },
      { lat: -25.4635, lng: 31.0215 },
      { lat: -25.465, lng: 31.018 },
    ],
    managedByOrgId: "org-mpumalanga-wildlife",
    notes: [],
  },
  {
    id: "zone-07",
    corridorId: "corridor-07",
    name: "Zone 07 — Kruger Fence Line",
    riskLevel: "medium",
    boundary: [
      { lat: -24.986, lng: 31.562 },
      { lat: -24.9845, lng: 31.5655 },
      { lat: -24.9875, lng: 31.5665 },
      { lat: -24.989, lng: 31.563 },
    ],
    managedByOrgId: "org-mpumalanga-wildlife",
    notes: [],
  },
];

export const MOCK_DEVICES: Device[] = [
  {
    id: "device-wc003",
    deviceCode: "WC-003",
    zoneId: "zone-03",
    corridorId: "corridor-03",
    position: { lat: -25.4612, lng: 31.019 },
    status: "online",
    lastSeen: new Date().toISOString(),
    hazardThresholdCm: 50,
    firmwareVersion: "0.1.0-mvp",
  },
  {
    id: "device-wc007",
    deviceCode: "WC-007",
    zoneId: "zone-07",
    corridorId: "corridor-07",
    position: { lat: -24.9858, lng: 31.5642 },
    status: "online",
    lastSeen: new Date().toISOString(),
    hazardThresholdCm: 50,
    firmwareVersion: "0.1.0-mvp",
  },
];

export const MOCK_TRUCKS: Truck[] = [
  {
    id: "truck-01",
    companyId: "company-lowveld-logistics",
    plateNumber: "MP 12 AB GP",
    model: "Volvo FH16 — Flatbed",
    assignedDriverId: "driver-01",
    status: "active",
    currentPosition: { lat: -25.472, lng: 30.995, heading: 48 },
    currentRouteId: "corridor-03",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "truck-02",
    companyId: "company-lowveld-logistics",
    plateNumber: "MP 45 CD GP",
    model: "Scania R500 — Tanker",
    assignedDriverId: "driver-02",
    status: "active",
    currentPosition: { lat: -25.001, lng: 31.539, heading: 60 },
    currentRouteId: "corridor-07",
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_EVENTS: WildGuardEvent[] = [];
export const MOCK_HAZARDS: Hazard[] = [];
export const MOCK_ALERTS: Alert[] = [];
