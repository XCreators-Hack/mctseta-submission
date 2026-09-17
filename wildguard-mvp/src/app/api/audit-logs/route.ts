import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    await requireCaller(req, ["admin"]);
    const snap = await adminDb!
      .collection("auditLogs")
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();
    return NextResponse.json({
      logs: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list audit logs" },
      { status: 401 }
    );
  }
}
