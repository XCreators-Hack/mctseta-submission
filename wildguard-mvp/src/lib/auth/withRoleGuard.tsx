"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { ROLE_HOME } from "@/constants/roles";
import type { UserRole } from "@/types";

export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function Guarded(props: P) {
    const { profile, loading, firebaseUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;
      if (!firebaseUser) {
        router.replace("/login");
        return;
      }
      if (profile && !allowedRoles.includes(profile.role)) {
        router.replace(ROLE_HOME[profile.role]);
      }
    }, [loading, firebaseUser, profile, router]);

    if (loading || !profile) {
      return (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Loading…
        </div>
      );
    }

    if (!allowedRoles.includes(profile.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}
