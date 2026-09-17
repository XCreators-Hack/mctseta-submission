"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_HOME } from "@/constants/roles";

export default function Home() {
  const { firebaseUser, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
    } else if (profile) {
      router.replace(ROLE_HOME[profile.role]);
    }
  }, [loading, firebaseUser, profile, router]);

  return (
    <div className="flex h-screen items-center justify-center text-sm text-slate-400">
      Loading WildGuard…
    </div>
  );
}
