import type { UserRole } from "@/types";

export const ROLES: UserRole[] = ["admin", "driver", "logistics", "wildlife"];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  driver: "Driver",
  logistics: "Logistics Company",
  wildlife: "Wildlife Management",
};

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  driver: "/driver",
  logistics: "/logistics",
  wildlife: "/wildlife",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-slate-700 text-white",
  driver: "bg-amber-600 text-white",
  logistics: "bg-sky-700 text-white",
  wildlife: "bg-emerald-700 text-white",
};
