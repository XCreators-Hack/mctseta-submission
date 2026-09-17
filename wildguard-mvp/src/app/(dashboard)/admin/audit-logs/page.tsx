"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useCollection } from "@/hooks/useCollection";
import { orderBy, limit } from "firebase/firestore";
import type { AuditLog } from "@/types";
import { formatDistanceToNow } from "date-fns";

function AuditLogPage() {
  const { data: logs, isMock } = useCollection<AuditLog>(
    "auditLogs",
    [orderBy("timestamp", "desc"), limit(100)]
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit log</h1>
        <p className="text-sm text-slate-500">Every system-recorded action, most recent first.</p>
      </div>

      {isMock && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Connect Firebase to see real audit entries — trigger Demo Mode from
          the Admin overview to generate some once connected.
        </p>
      )}

      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {logs.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-slate-400">No audit entries yet.</li>
        )}
        {logs.map((log) => (
          <li key={log.id} className="px-4 py-3 text-sm">
            <p className="font-medium text-slate-800">{log.action}</p>
            <p className="text-xs text-slate-500">
              {log.targetType} · {log.targetId} · by {log.actorUid} ·{" "}
              {safeRelative(log.timestamp)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function safeRelative(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export default withRoleGuard(AuditLogPage, ["admin"]);
