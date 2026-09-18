"use client";

import { useEffect, useState } from "react";
import { getHealth, getApiBaseUrl } from "@/lib/api";
import { POLL_INTERVAL_MS } from "@/lib/config";
import ConnectionStatus from "@/components/ConnectionStatus";
import LastUpdated from "@/components/LastUpdated";
import CopyableValue from "@/components/CopyableValue";
import InfoRow from "@/components/InfoRow";
import SpecPanel from "@/components/SpecPanel";

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
        setCheckedAt(new Date().toISOString());
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

  const apiUrl = getApiBaseUrl();

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <SpecPanel title="Connectivity">
        <InfoRow
          label="API status"
          value={
            <ConnectionStatus
              online={apiOnline === true}
              label={apiOnline === null ? "Checking" : apiOnline ? "Online" : "Offline"}
            />
          }
        />
        <InfoRow label="API URL" value={apiUrl ? <CopyableValue value={apiUrl} /> : "Not configured"} />
        <InfoRow label="Last health check" value={<LastUpdated isoString={checkedAt} />} />
      </SpecPanel>

      <SpecPanel title="Runtime">
        <InfoRow label="Environment" value={process.env.NODE_ENV} />
        <InfoRow label="Telemetry refresh rate" value={`${POLL_INTERVAL_MS / 1000}s`} />
      </SpecPanel>

      <p className="text-xs text-muted">
        API keys and device credentials are never exposed to the frontend. This page only reflects
        connectivity, not authentication.
      </p>
    </div>
  );
}
