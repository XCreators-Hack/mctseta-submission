import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CreateDriverSchema = z.object({
  name: z.string().min(1),
  licenseNo: z.string().min(1),
  userId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const caller = await requireCaller(req);
    let q = adminDb!.collection("drivers") as FirebaseFirestore.Query;
    if (caller.role === "logistics" && caller.companyId) {
      q = q.where("companyId", "==", caller.companyId);
    }
    const snap = await q.get();
    return NextResponse.json({
      drivers: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list drivers" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const caller = await requireCaller(req, ["logistics", "admin"]);
    const parsed = CreateDriverSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const ref = await adminDb!.collection("drivers").add({
      ...parsed.data,
      companyId: caller.companyId,
      status: "off-duty",
    });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create driver" },
      { status: 403 }
    );
  }
}
