import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CommandSchema = z.object({
  action: z.enum(["RESET", "FORCE_CLEAR"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCaller(req, ["admin"]);
    const { id } = await params;
    const parsed = CommandSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    const deviceSnap = await adminDb!.collection("devices").doc(id).get();
    if (!deviceSnap.exists) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }
    const device = deviceSnap.data()!;

    if (parsed.data.action === "FORCE_CLEAR") {
      await adminDb!
        .collection("corridors")
        .doc(device.corridorId)
        .set({ state: "NORMAL", updatedAt: new Date().toISOString() }, { merge: true });

      const activeHazards = await adminDb!
        .collection("hazards")
        .where("deviceId", "==", id)
        .where("status", "in", ["ACTIVE", "ACKNOWLEDGED"])
        .get();
      await Promise.all(
        activeHazards.docs.map((d) =>
          d.ref.set(
            { status: "CLEARED", clearedAt: new Date().toISOString() },
            { merge: true }
          )
        )
      );
    }

    return NextResponse.json({ ok: true, command: parsed.data.action });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Command failed" },
      { status: 403 }
    );
  }
}
