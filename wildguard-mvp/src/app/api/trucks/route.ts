import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CreateTruckSchema = z.object({
  plateNumber: z.string().min(1),
  model: z.string().min(1),
  assignedDriverId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const caller = await requireCaller(req);
    let q = adminDb!.collection("trucks") as FirebaseFirestore.Query;
    if (caller.role === "logistics" && caller.companyId) {
      q = q.where("companyId", "==", caller.companyId);
    }
    const snap = await q.get();
    return NextResponse.json({
      trucks: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list trucks" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const caller = await requireCaller(req, ["logistics", "admin"]);
    if (!caller.companyId && caller.role === "logistics") {
      return NextResponse.json({ error: "Missing companyId claim" }, { status: 400 });
    }
    const parsed = CreateTruckSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const ref = await adminDb!.collection("trucks").add({
      ...parsed.data,
      companyId: caller.companyId,
      status: "idle",
      currentPosition: { lat: -25.4653, lng: 31.0107, heading: 0 },
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create truck" },
      { status: 403 }
    );
  }
}
