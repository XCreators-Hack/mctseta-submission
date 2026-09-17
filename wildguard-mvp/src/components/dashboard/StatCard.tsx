import clsx from "clsx";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "critical" | "good";
  icon?: ReactNode;
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-slate-200",
  good: "border-emerald-200",
  warning: "border-amber-300",
  critical: "border-red-300",
};

export function StatCard({ label, value, hint, tone = "default", icon }: StatCardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border bg-white p-4 shadow-sm",
        TONE_STYLES[tone]
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
