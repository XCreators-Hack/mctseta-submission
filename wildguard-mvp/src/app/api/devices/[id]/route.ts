import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCaller(req, ["admin"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    await adminDb!.collection("devices").doc(id).set(body, { merge: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update device" },
      { status: 403 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCaller(req, ["admin"]);
    const { id } = await params;
    await adminDb!.collection("devices").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete device" },
      { status: 403 }
    );
  }
}
