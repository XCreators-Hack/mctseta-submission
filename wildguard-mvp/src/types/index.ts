export type UserRole = "admin" | "driver" | "logistics" | "wildlife";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyId?: string; // for driver / logistics
  orgId?: string; // for wildlife-management
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Company {
  id: string;
  name: string;
  contactEmail: string;
  active: boolean;
  createdAt: string;
}

export interface WildlifeOrg {
  id: string;
  name: string;
  region: string;
  active: boolean;
  createdAt: string;
}

export interface Driver {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  licenseNo: string;
  assignedTruckId?: string;
  status: "on-duty" | "off-duty";
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Truck {
  id: string;
  companyId: string;
  plateNumber: string;
  model: string;
  assignedDriverId?: string;
  status: "active" | "idle" | "maintenance";
  currentPosition: LatLng & { heading: number };
  currentRouteId?: string;
  updatedAt: string;
}

export type DeviceStatus = "online" | "offline";

export interface Device {
  id: string;
  deviceCode: string;
  zoneId: string;
  corridorId: string;
  position: LatLng;
  status: DeviceStatus;
  lastSeen: string;
  hazardThresholdCm: number;
  firmwareVersion: string;
}

export type CorridorState =
  | "NORMAL"
  | "HAZARD_DETECTED"
  | "WARNING_ACTIVE"
  | "INTERVENTION_ACTIVE"
  | "CLEARANCE";

export interface Corridor {
  id: string;
  name: string;
  geometryPath: LatLng[];
  state: CorridorState;
  speedLimitKmh: number;
  updatedAt: string;
}

export type RiskLevel = "low" | "medium" | "high";

export interface ZoneNote {
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Zone {
  id: string;
  corridorId: string;
  name: string;
  riskLevel: RiskLevel;
  boundary: LatLng[];
  managedByOrgId?: string;
  notes: ZoneNote[];
}

export type HazardStatus = "ACTIVE" | "ACKNOWLEDGED" | "CLEARED";

export interface Hazard {
  id: string;
  zoneId: string;
  corridorId: string;
  deviceId: string;
  eventId: string;
  distanceCm: number;
  status: HazardStatus;
  createdAt: string;
  clearedAt?: string;
  acknowledgedBy: string[];
}

export type EventType = "HAZARD_DETECTED" | "MANUAL_REPORT" | "CLEARANCE";
export type EventSource = "esp32" | "demo" | "manual";

export interface WildGuardEvent {
  id: string;
  deviceId: string;
  zoneId: string;
  corridorId: string;
  eventType: EventType;
  distance: number;
  source: EventSource;
  timestamp: string;
  status: HazardStatus | "RECEIVED";
}

export type AlertSeverity = "warning" | "critical";

export interface Alert {
  id: string;
  hazardId: string;
  corridorId: string;
  zoneId: string;
  severity: AlertSeverity;
  targetRoles: UserRole[];
  acknowledgedBy: string[];
  createdAt: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  distanceCm: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
