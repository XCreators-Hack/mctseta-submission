"use client";

import { orderBy, limit as fsLimit, where } from "firebase/firestore";
import { useCollection } from "./useCollection";
import {
  MOCK_ALERTS,
  MOCK_CORRIDORS,
  MOCK_DEVICES,
  MOCK_EVENTS,
  MOCK_HAZARDS,
  MOCK_TRUCKS,
  MOCK_ZONES,
} from "@/lib/demo/mockData";
import type {
  Alert,
  Corridor,
  Device,
  Hazard,
  Truck,
  WildGuardEvent,
  Zone,
} from "@/types";

export function useCorridors() {
  return useCollection<Corridor>("corridors", [], MOCK_CORRIDORS);
}

export function useZones() {
  return useCollection<Zone>("zones", [], MOCK_ZONES);
}

export function useDevices() {
  return useCollection<Device>("devices", [], MOCK_DEVICES);
}

export function useTrucks(companyId?: string) {
  const constraints = companyId ? [where("companyId", "==", companyId)] : [];
  const mock = companyId
    ? MOCK_TRUCKS.filter((t) => t.companyId === companyId)
    : MOCK_TRUCKS;
  return useCollection<Truck>("trucks", constraints, mock);
}

export function useEvents(max = 50) {
  return useCollection<WildGuardEvent>(
    "events",
    [orderBy("timestamp", "desc"), fsLimit(max)],
    MOCK_EVENTS
  );
}

export function useActiveHazards() {
  return useCollection<Hazard>(
    "hazards",
    [where("status", "in", ["ACTIVE", "ACKNOWLEDGED"])],
    MOCK_HAZARDS
  );
}

export function useAlertsForRole(role?: string) {
  const constraints = role ? [where("targetRoles", "array-contains", role)] : [];
  return useCollection<Alert>("alerts", constraints, MOCK_ALERTS);
}
