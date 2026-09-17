import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireCaller(req, ["admin", "wildlife"]);
    const { id } = await params;
    const timestamp = new Date().toISOString();
    const hazardRef = adminDb!.collection("hazards").doc(id);
    const hazardSnap = await hazardRef.get();
    if (!hazardSnap.exists) {
      return NextResponse.json({ error: "Hazard not found" }, { status: 404 });
    }
    const hazard = hazardSnap.data()!;

    await hazardRef.set({ status: "CLEARED", clearedAt: timestamp }, { merge: true });
    await adminDb!
      .collection("corridors")
      .doc(hazard.corridorId)
      .set({ state: "CLEARANCE", updatedAt: timestamp }, { merge: true });

    await adminDb!.collection("auditLogs").add({
      actorUid: caller.uid,
      action: "HAZARD_CLEARED",
      targetType: "hazard",
      targetId: id,
      timestamp,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to clear hazard" },
      { status: 403 }
    );
  }
}
