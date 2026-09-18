"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-5 py-5 border-b border-border flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-accent pulse shrink-0" aria-hidden="true" />
        <div>
          <div className="text-sm font-semibold text-text">EcoWildGuard</div>
          <div className="text-xs text-muted mt-0.5">Crossing monitoring</div>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surfaceRaised text-text border border-border"
                  : "text-muted hover:text-text hover:bg-surfaceRaised/60 border border-transparent",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 border-t border-border text-[11px] text-muted">
        <div>Prototype build</div>
        <div className="mono mt-0.5">v0.2.0</div>
      </div>
    </aside>
  );
}
