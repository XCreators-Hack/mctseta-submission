import { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import type { UserRole } from "@/types";

export interface AuthedCaller {
  uid: string;
  role: UserRole;
  companyId?: string;
  orgId?: string;
}

/**
 * Verifies the Firebase ID token sent in the Authorization header
 * (`Bearer <token>`) and returns the decoded custom claims. API routes use
 * this to re-check permissions server-side — client-side role guards are UX
 * only, not security.
 */
export async function requireCaller(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<AuthedCaller> {
  if (!adminAuth) {
    throw new Error("Firebase Admin is not configured.");
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    throw new Error("Missing Authorization header");
  }
  const decoded = await adminAuth.verifyIdToken(token);
  const role = decoded.role as UserRole | undefined;
  if (!role) {
    throw new Error("Token missing role claim");
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    throw new Error("Forbidden");
  }
  return {
    uid: decoded.uid,
    role,
    companyId: decoded.companyId as string | undefined,
    orgId: decoded.orgId as string | undefined,
  };
}
