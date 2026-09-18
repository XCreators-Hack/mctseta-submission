"use client";

import { useEffect, useState } from "react";
import { getHealth, getApiBaseUrl } from "@/lib/api";
import { POLL_INTERVAL_MS } from "@/lib/config";
import ConnectionStatus from "@/components/ConnectionStatus";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm text-text mono">{value}</span>
    </div>
  );
}

export default function SystemPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;

    async function check() {
      if (inFlight) return;
      inFlight = true;
      const result = await getHealth(controller.signal);
      if (!controller.signal.aborted) {
        setApiOnline(result.kind === "ok");
        setCheckedAt(new Date().toLocaleTimeString());
      }
      inFlight = false;
    }

    check();
    const id = setInterval(check, POLL_INTERVAL_MS);

    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <h2 className="text-sm font-medium text-text">System</h2>

      <div className="rounded border border-border bg-surface px-4">
        <InfoRow
          label="API Status"
          value={<ConnectionStatus online={apiOnline === true} label={apiOnline === null ? "Checking..." : apiOnline ? "Online" : "Offline"} />}
        />
        <InfoRow label="Frontend Status" value={<ConnectionStatus online={true} label="Running" />} />
        <InfoRow label="Current API URL" value={getApiBaseUrl() || "Not configured"} />
        <InfoRow label="Telemetry Refresh Rate" value={`${POLL_INTERVAL_MS / 1000}s`} />
        <InfoRow label="Last Health Check" value={checkedAt ?? "—"} />
      </div>

      <p className="text-xs text-muted">
        API keys and device credentials are never exposed to the frontend. This page only reflects
        connectivity, not authentication.
      </p>
    </div>
  );
}
