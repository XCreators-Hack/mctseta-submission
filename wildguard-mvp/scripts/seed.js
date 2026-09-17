/**
 * Seeds Firestore with demo data so the hackathon judges see a populated
 * system immediately: companies, a wildlife org, corridors, zones, devices,
 * trucks, drivers, and one user per role (all with password "wildguard123").
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Requires FIREBASE_ADMIN_* env vars to be set in .env.local (loaded below
 * with dotenv). Safe to re-run — it overwrites documents by fixed id rather
 * than duplicating them.
 */
require("dotenv").config({ path: ".env.local" });
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "Missing FIREBASE_ADMIN_* env vars in .env.local — cannot seed Firestore."
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();
const auth = getAuth();

const now = new Date().toISOString();

async function upsertUser({ uid, email, password, displayName, role, companyId, orgId }) {
  try {
    await auth.getUser(uid);
  } catch {
    await auth.createUser({ uid, email, password, displayName });
  }
  await auth.setCustomUserClaims(uid, { role, companyId, orgId });
  await db.collection("users").doc(uid).set({
    uid,
    email,
    displayName,
    role,
    companyId: companyId ?? null,
    orgId: orgId ?? null,
    active: true,
    createdAt: now,
  });
  console.log(`Seeded user: ${email} (${role}) / password: ${password}`);
}

async function main() {
  console.log("Seeding companies, orgs, corridors, zones, devices, trucks, drivers…");

  await db.collection("companies").doc("company-lowveld-logistics").set({
    id: "company-lowveld-logistics",
    name: "Lowveld Logistics (Pty) Ltd",
    contactEmail: "ops@lowveldlogistics.co.za",
    active: true,
    createdAt: now,
  });

  await db.collection("wildlifeOrgs").doc("org-mpumalanga-wildlife").set({
    id: "org-mpumalanga-wildlife",
    name: "Mpumalanga Wildlife Management Authority",
    region: "Mpumalanga",
    active: true,
    createdAt: now,
  });

  const corridors = [
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
      updatedAt: now,
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
      updatedAt: now,
    },
  ];
  for (const c of corridors) await db.collection("corridors").doc(c.id).set(c);

  const zones = [
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
  for (const z of zones) await db.collection("zones").doc(z.id).set(z);

  const devices = [
    {
      id: "device-wc003",
      deviceCode: "WC-003",
      zoneId: "zone-03",
      corridorId: "corridor-03",
      position: { lat: -25.4612, lng: 31.019 },
      status: "offline",
      lastSeen: now,
      hazardThresholdCm: 50,
      firmwareVersion: "0.1.0-mvp",
    },
    {
      id: "device-wc007",
      deviceCode: "WC-007",
      zoneId: "zone-07",
      corridorId: "corridor-07",
      position: { lat: -24.9858, lng: 31.5642 },
      status: "offline",
      lastSeen: now,
      hazardThresholdCm: 50,
      firmwareVersion: "0.1.0-mvp",
    },
  ];
  for (const d of devices) await db.collection("devices").doc(d.id).set(d);

  await db.collection("drivers").doc("driver-01").set({
    id: "driver-01",
    userId: "user-driver-01",
    companyId: "company-lowveld-logistics",
    name: "Sipho Mahlangu",
    licenseNo: "MP-DRV-00123",
    assignedTruckId: "truck-01",
    status: "on-duty",
  });

  const trucks = [
    {
      id: "truck-01",
      companyId: "company-lowveld-logistics",
      plateNumber: "MP 12 AB GP",
      model: "Volvo FH16 — Flatbed",
      assignedDriverId: "driver-01",
      status: "active",
      currentPosition: { lat: -25.472, lng: 30.995, heading: 48 },
      currentRouteId: "corridor-03",
      updatedAt: now,
    },
    {
      id: "truck-02",
      companyId: "company-lowveld-logistics",
      plateNumber: "MP 45 CD GP",
      model: "Scania R500 — Tanker",
      status: "active",
      currentPosition: { lat: -25.001, lng: 31.539, heading: 60 },
      currentRouteId: "corridor-07",
      updatedAt: now,
    },
  ];
  for (const t of trucks) await db.collection("trucks").doc(t.id).set(t);

  // One demo user per role, all sharing password "wildguard123".
  await upsertUser({
    uid: "user-admin-01",
    email: "admin@wildguard.demo",
    password: "wildguard123",
    displayName: "System Admin",
    role: "admin",
  });
  await upsertUser({
    uid: "user-driver-01",
    email: "driver@wildguard.demo",
    password: "wildguard123",
    displayName: "Sipho Mahlangu",
    role: "driver",
    companyId: "company-lowveld-logistics",
  });
  await upsertUser({
    uid: "user-logistics-01",
    email: "logistics@wildguard.demo",
    password: "wildguard123",
    displayName: "Lowveld Logistics Ops",
    role: "logistics",
    companyId: "company-lowveld-logistics",
  });
  await upsertUser({
    uid: "user-wildlife-01",
    email: "wildlife@wildguard.demo",
    password: "wildguard123",
    displayName: "Mpumalanga Wildlife Officer",
    role: "wildlife",
    orgId: "org-mpumalanga-wildlife",
  });

  console.log("\nSeed complete. Sign in with any of the accounts above.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
