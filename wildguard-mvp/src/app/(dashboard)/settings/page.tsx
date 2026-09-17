"use client";

import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_LABELS } from "@/constants/roles";

function SettingsPage() {
  const { profile, firebaseUser } = useAuth();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile & settings</h1>
        <p className="text-sm text-slate-500">Your account details for WildGuard.</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <dl className="space-y-3 text-sm">
          <Row label="Name" value={profile?.displayName ?? "—"} />
          <Row label="Email" value={profile?.email ?? firebaseUser?.email ?? "—"} />
          <Row label="Role" value={profile ? ROLE_LABELS[profile.role] : "—"} />
          {profile?.companyId && <Row label="Company ID" value={profile.companyId} />}
          {profile?.orgId && <Row label="Organization ID" value={profile.orgId} />}
          <Row label="Account status" value={profile?.active ? "Active" : "Deactivated"} />
        </dl>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-800">Notifications</p>
        <p className="mt-1 text-xs text-slate-500">
          Hazard alerts are delivered in real time to this dashboard and the
          Alerts page for your role. Push/SMS notifications are a
          production-scope extension beyond this hackathon MVP.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export default withRoleGuard(SettingsPage, ["admin", "driver", "logistics", "wildlife"]);
