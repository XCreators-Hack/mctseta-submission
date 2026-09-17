import { adminDb } from "@/lib/firebase/admin";
import {
  CORRIDOR_STATE_PROFILES,
  nextCorridorState,
} from "@/lib/stateMachine/corridorState";
import type {
  Corridor,
  CorridorState,
  Device,
  EventSource,
  Hazard,
} from "@/types";

export interface IngestEventInput {
  deviceId: string; // Firestore doc id OR deviceCode — resolved below
  distance: number;
  source: EventSource;
  timestamp?: string;
}

export interface IngestEventResult {
  eventId: string;
  hazardId: string | null;
  corridorState: CorridorState;
  command: "ACTIVATE_WARNING" | "CLEAR" | "HOLD";
}

/**
 * The single source of truth for turning a raw distance reading into an
 * event + hazard + corridor-state transition + alert. Called identically by
 * POST /api/events (real ESP32 or authenticated demo callers) and by
 * POST /api/simulate (Demo Mode UI button) — so a simulated event behaves
 * exactly like a real one, as required by the spec.
 */
export async function ingestSensorEvent(
  input: IngestEventInput
): Promise<IngestEventResult> {
  if (!adminDb) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_* env vars."
    );
  }

  const timestamp = input.timestamp ?? new Date().toISOString();

  // Resolve device by doc id first, then by deviceCode.
  let deviceSnap = await adminDb.collection("devices").doc(input.deviceId).get();
  let deviceRef = deviceSnap.ref;
  if (!deviceSnap.exists) {
    const byCode = await adminDb
      .collection("devices")
      .where("deviceCode", "==", input.deviceId)
      .limit(1)
      .get();
    if (byCode.empty) {
      throw new Error(`Unknown device: ${input.deviceId}`);
    }
    deviceSnap = byCode.docs[0];
    deviceRef = deviceSnap.ref;
  }
  const device = deviceSnap.data() as Device;

  const corridorRef = adminDb.collection("corridors").doc(device.corridorId);
  const corridorSnap = await corridorRef.get();
  const corridor = corridorSnap.data() as Corridor | undefined;
  const currentState: CorridorState = corridor?.state ?? "NORMAL";

  const isHazard = input.distance < device.hazardThresholdCm;
  const eventType = isHazard ? "HAZARD_DETECTED" : "CLEARANCE";

  const eventRef = await adminDb.collection("events").add({
    deviceId: device.id ?? deviceRef.id,
    zoneId: device.zoneId,
    corridorId: device.corridorId,
    eventType,
    distance: input.distance,
    source: input.source,
    timestamp,
    status: isHazard ? "ACTIVE" : "CLEARED",
  });

  // Mark device as online / seen.
  await deviceRef.set(
    { status: "online", lastSeen: timestamp },
    { merge: true }
  );

  let hazardId: string | null = null;
  let newState: CorridorState = currentState;
  let command: IngestEventResult["command"] = "HOLD";

  if (isHazard) {
    newState =
      currentState === "NORMAL" ? "HAZARD_DETECTED" : nextCorridorState(currentState);
    if (newState === "CLEARANCE") newState = "INTERVENTION_ACTIVE"; // stay active while hazard persists

    const hazardRef = await adminDb.collection("hazards").add({
      zoneId: device.zoneId,
      corridorId: device.corridorId,
      deviceId: device.id ?? deviceRef.id,
      eventId: eventRef.id,
      distanceCm: input.distance,
      status: "ACTIVE",
      createdAt: timestamp,
      acknowledgedBy: [],
    } satisfies Omit<Hazard, "id">);
    hazardId = hazardRef.id;

    await adminDb.collection("alerts").add({
      hazardId: hazardRef.id,
      corridorId: device.corridorId,
      zoneId: device.zoneId,
      severity: newState === "INTERVENTION_ACTIVE" ? "critical" : "warning",
      targetRoles: ["driver", "logistics", "wildlife", "admin"],
      acknowledgedBy: [],
      createdAt: timestamp,
    });

    command = "ACTIVATE_WARNING";
  } else {
    newState = "CLEARANCE";
    command = "CLEAR";

    // Close out any active hazards for this device.
    const activeHazards = await adminDb
      .collection("hazards")
      .where("deviceId", "==", device.id ?? deviceRef.id)
      .where("status", "in", ["ACTIVE", "ACKNOWLEDGED"])
      .get();
    await Promise.all(
      activeHazards.docs.map((d) =>
        d.ref.set({ status: "CLEARED", clearedAt: timestamp }, { merge: true })
      )
    );
  }

  await corridorRef.set(
    {
      state: newState,
      speedLimitKmh: CORRIDOR_STATE_PROFILES[newState].speedLimitKmh,
      updatedAt: timestamp,
    },
    { merge: true }
  );

  await adminDb.collection("auditLogs").add({
    actorUid: input.source === "demo" ? "demo-mode" : "esp32-device",
    action: "EVENT_INGESTED",
    targetType: "device",
    targetId: device.id ?? deviceRef.id,
    timestamp,
    metadata: { distance: input.distance, source: input.source, newState },
  });

  return { eventId: eventRef.id, hazardId, corridorState: newState, command };
}
