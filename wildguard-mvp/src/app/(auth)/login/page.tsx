"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_HOME } from "@/constants/roles";
import { isFirebaseConfigured } from "@/lib/firebase/client";

export default function LoginPage() {
  const { signIn, profile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email, password);
      // Redirect happens once the profile doc resolves; fallback to admin.
      router.replace(profile ? ROLE_HOME[profile.role] : "/admin");
    } catch {
      setError("Couldn't sign in. Check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      {/* Left: corridor motif panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-tarmac)] p-12 text-[var(--color-paper)] lg:flex">
        <CorridorMotif />
        <div className="relative z-10">
          <p className="font-mono text-xs tracking-wide text-emerald-300/80">
            MICT SETA NATIONAL SKILLS HACKATHON · MPUMALANGA
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">
            One shared picture of the corridor, for everyone who needs it.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-slate-300">
            WildGuard links roadside sensors, drivers, logistics companies and
            wildlife-management teams so a hazard near the road reaches the
            right people in seconds, not shift-change reports.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4 text-xs text-slate-400">
          <div>
            <p className="font-mono text-lg text-emerald-300">04</p>
            <p>coordinated roles</p>
          </div>
          <div>
            <p className="font-mono text-lg text-amber-300">3D</p>
            <p>corridor map</p>
          </div>
          <div>
            <p className="font-mono text-lg text-sky-300">&lt;1s</p>
            <p>event to alert</p>
          </div>
        </div>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center bg-[var(--color-paper)] px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <p className="font-mono text-xs tracking-wide text-emerald-800">WILDGUARD</p>
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use the account issued by your system administrator.
          </p>

          {!isFirebaseConfigured && (
            <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              Firebase isn&apos;t configured yet (.env.local is empty). Add your
              Firebase project keys to sign in with real accounts — until then
              this app runs on demo data only.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                placeholder="you@company.co.za"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[var(--color-corridor-green)] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CorridorMotif() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 600 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <path d="M0 800 L220 0" stroke="#2c3238" strokeWidth="140" />
      <path
        d="M110 800 L330 0"
        stroke="#f6f5f1"
        strokeWidth="3"
        strokeDasharray="18 22"
        opacity="0.5"
      />
      <circle cx="470" cy="120" r="3" fill="#f5c563" />
      <circle cx="500" cy="260" r="3" fill="#f5c563" />
      <circle cx="440" cy="420" r="3" fill="#e15a4d" />
      <circle cx="520" cy="580" r="3" fill="#f5c563" />
    </svg>
  );
}
