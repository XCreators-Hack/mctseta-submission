"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export default function Header() {
  const pathname = usePathname();
  const page = NAV_ITEMS.find((item) => item.href === pathname) ?? {
    label: "EcoWildGuard",
    subtitle: "",
  };

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <div>
          <h1 className="text-sm font-medium text-text">{page.label}</h1>
          {page.subtitle && <p className="text-xs text-muted">{page.subtitle}</p>}
        </div>
      </div>

      {/* Mobile navigation — the sidebar is desktop-only. */}
      <nav className="md:hidden flex gap-1 overflow-x-auto px-3 pb-2 -mt-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "shrink-0 rounded px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors border",
                active
                  ? "bg-surfaceRaised text-text border-border"
                  : "text-muted border-transparent hover:text-text",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
