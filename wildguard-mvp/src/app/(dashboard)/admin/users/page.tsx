"use client";

import { useState, type FormEvent } from "react";
import { withRoleGuard } from "@/lib/auth/withRoleGuard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCollection } from "@/hooks/useCollection";
import type { AppUser, UserRole } from "@/types";
import { ROLE_LABELS } from "@/constants/roles";

function UserManagement() {
  const { firebaseUser } = useAuth();
  const { data: users, isMock } = useCollection<AppUser>("users");
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "driver" as UserRole,
    companyId: "",
    orgId: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setStatus("Creating…");
    try {
      const token = await firebaseUser?.getIdToken();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create user");
      }
      setStatus("User created.");
      setForm({ email: "", password: "", displayName: "", role: "driver", companyId: "", orgId: "" });
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to create user");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">User management</h1>
        <p className="text-sm text-slate-500">Create and review accounts across all roles.</p>
      </div>

      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Name" value={form.displayName} onChange={(v) => setForm({ ...form, displayName: v })} />
        <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
        <Input label="Temp. password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        <div>
          <label className="block text-xs font-medium text-slate-600">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            {(["admin", "driver", "logistics", "wildlife"] as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        <Input label="Company ID (logistics)" value={form.companyId} onChange={(v) => setForm({ ...form, companyId: v })} />
        <Input label="Org ID (wildlife)" value={form.orgId} onChange={(v) => setForm({ ...form, orgId: v })} />
        <div className="flex items-end">
          <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Create user
          </button>
        </div>
      </form>
      {status && <p className="text-xs text-slate-600">{status}</p>}
      {isMock && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Connect Firebase to manage real accounts — this list is empty until then.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="px-4 py-2.5 font-medium text-slate-800">{u.displayName}</td>
                <td className="px-4 py-2.5 text-slate-600">{u.email}</td>
                <td className="px-4 py-2.5 text-slate-600">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-2.5 text-slate-500">{u.active ? "Active" : "Deactivated"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
    </div>
  );
}

export default withRoleGuard(UserManagement, ["admin"]);
