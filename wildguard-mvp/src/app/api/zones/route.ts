import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CreateZoneSchema = z.object({
  corridorId: z.string().min(1),
  name: z.string().min(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  boundary: z.array(z.object({ lat: z.number(), lng: z.number() })).min(3),
  managedByOrgId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireCaller(req);
    const snap = await adminDb!.collection("zones").get();
    return NextResponse.json({
      zones: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list zones" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireCaller(req, ["admin", "wildlife"]);
    const parsed = CreateZoneSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const ref = await adminDb!.collection("zones").add({
      ...parsed.data,
      notes: [],
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create zone" },
      { status: 403 }
    );
  }
}
