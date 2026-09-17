import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CreateDeviceSchema = z.object({
  deviceCode: z.string().min(1),
  zoneId: z.string().min(1),
  corridorId: z.string().min(1),
  position: z.object({ lat: z.number(), lng: z.number() }),
  hazardThresholdCm: z.number().positive().default(50),
  firmwareVersion: z.string().default("0.1.0-mvp"),
});

export async function GET(req: NextRequest) {
  try {
    await requireCaller(req); // any authenticated role may read devices
    const snap = await adminDb!.collection("devices").get();
    const devices = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ devices });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list devices" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireCaller(req, ["admin"]);
    const body = await req.json().catch(() => null);
    const parsed = CreateDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const ref = await adminDb!.collection("devices").add({
      ...parsed.data,
      status: "offline",
      lastSeen: new Date().toISOString(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create device" },
      { status: 403 }
    );
  }
}
