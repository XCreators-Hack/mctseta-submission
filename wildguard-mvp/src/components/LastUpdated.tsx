"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime, formatTimestamp } from "@/lib/format";

interface LastUpdatedProps {
  isoString: string | null;
}

/**
 * Re-renders the relative "Xs ago" label every second so it stays accurate
 * between telemetry polls, without needing a new fetch.
 */
export default function LastUpdated({ isoString }: LastUpdatedProps) {
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!isoString) {
    return <span className="text-muted">—</span>;
  }

  return (
    <span className="text-muted">
      {formatRelativeTime(isoString)}{" "}
      <span className="mono text-[11px] text-muted/70">({formatTimestamp(isoString)})</span>
    </span>
  );
}
