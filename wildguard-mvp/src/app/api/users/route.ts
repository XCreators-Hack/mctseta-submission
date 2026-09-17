import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireCaller } from "@/lib/apiAuth";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
  role: z.enum(["admin", "driver", "logistics", "wildlife"]),
  companyId: z.string().optional(),
  orgId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireCaller(req, ["admin"]);
    const snap = await adminDb!.collection("users").get();
    return NextResponse.json({
      users: snap.docs.map((d) => ({ uid: d.id, ...d.data() })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list users" },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireCaller(req, ["admin"]);
    const parsed = CreateUserSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { email, password, displayName, role, companyId, orgId } = parsed.data;

    const userRecord = await adminAuth!.createUser({ email, password, displayName });

    // Custom claims let Firestore Security Rules check role/company without
    // an extra read.
    await adminAuth!.setCustomUserClaims(userRecord.uid, { role, companyId, orgId });

    await adminDb!.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      companyId: companyId ?? null,
      orgId: orgId ?? null,
      active: true,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create user" },
      { status: 403 }
    );
  }
}
