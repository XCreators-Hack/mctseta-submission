"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_HOME, ROLE_LABELS } from "@/constants/roles";
import type { UserRole } from "@/types";

const NAV_ITEMS: Record<UserRole, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin", label: "Overview" },
    { href: "/map", label: "Corridor Map" },
    { href: "/admin/devices", label: "Devices" },
    { href: "/admin/zones", label: "Zones" },
    { href: "/admin/users", label: "Users" },
    { href: "/alerts", label: "Alerts" },
    { href: "/events", label: "History" },
    { href: "/admin/audit-logs", label: "Audit Log" },
  ],
  driver: [
    { href: "/driver", label: "My Route" },
    { href: "/map", label: "Corridor Map" },
    { href: "/alerts", label: "Alerts" },
  ],
  logistics: [
    { href: "/logistics", label: "Fleet Overview" },
    { href: "/map", label: "Corridor Map" },
    { href: "/logistics/fleet", label: "Manage Fleet" },
    { href: "/alerts", label: "Alerts" },
    { href: "/events", label: "History" },
  ],
  wildlife: [
    { href: "/wildlife", label: "Overview" },
    { href: "/map", label: "Corridor Map" },
    { href: "/admin/zones", label: "Zones" },
    { href: "/alerts", label: "Alerts" },
    { href: "/events", label: "History" },
  ],
};

export function TopNav() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!profile) return null;
  const items = NAV_ITEMS[profile.role];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href={ROLE_HOME[profile.role]} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-corridor-green)]" />
          <span className="font-semibold tracking-tight text-slate-900">WildGuard</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">{profile.displayName}</p>
            <p className="text-xs text-slate-500">{ROLE_LABELS[profile.role]}</p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.replace("/login");
            }}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-md px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
