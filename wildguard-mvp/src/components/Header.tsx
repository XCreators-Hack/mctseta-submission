"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Live telemetry" },
  "/device": { title: "Device", subtitle: "Hardware and connection details" },
  "/system": { title: "System", subtitle: "API and frontend status" },
};

export default function Header() {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: "EcoWildGuard", subtitle: "" };

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 md:px-6 py-3">
      <div>
        <h1 className="text-sm font-medium text-text">{page.title}</h1>
        {page.subtitle && <p className="text-xs text-muted">{page.subtitle}</p>}
      </div>
    </header>
  );
}
