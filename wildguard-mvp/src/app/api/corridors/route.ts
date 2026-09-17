import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CreateCorridorSchema = z.object({
  name: z.string().min(1),
  geometryPath: z.array(z.object({ lat: z.number(), lng: z.number() })).min(2),
  speedLimitKmh: z.number().positive().default(80),
});

export async function GET(req: NextRequest) {
  try {
    await requireCaller(req);
    const snap = await adminDb!.collection("corridors").get();
    return NextResponse.json({
      corridors: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list corridors" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireCaller(req, ["admin"]);
    const parsed = CreateCorridorSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const ref = await adminDb!.collection("corridors").add({
      ...parsed.data,
      state: "NORMAL",
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create corridor" },
      { status: 403 }
    );
  }
}
