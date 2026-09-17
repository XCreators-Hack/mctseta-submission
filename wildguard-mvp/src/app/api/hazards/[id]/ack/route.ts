import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await requireCaller(req, ["driver", "wildlife", "logistics", "admin"]);
    const { id } = await params;
    const hazardRef = adminDb!.collection("hazards").doc(id);
    await hazardRef.set(
      {
        status: "ACKNOWLEDGED",
        acknowledgedBy: FieldValue.arrayUnion(caller.uid),
      },
      { merge: true }
    );

    // Also mark related alerts acknowledged for this user.
    const alerts = await adminDb!
      .collection("alerts")
      .where("hazardId", "==", id)
      .get();
    await Promise.all(
      alerts.docs.map((d) =>
        d.ref.set(
          { acknowledgedBy: FieldValue.arrayUnion(caller.uid) },
          { merge: true }
        )
      )
    );

    await adminDb!.collection("auditLogs").add({
      actorUid: caller.uid,
      action: "HAZARD_ACKNOWLEDGED",
      targetType: "hazard",
      targetId: id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to acknowledge" },
      { status: 403 }
    );
  }
}
