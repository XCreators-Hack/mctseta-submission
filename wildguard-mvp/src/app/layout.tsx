import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/AuthContext";

export const metadata: Metadata = {
  title: "WildGuard — Smart Wildlife & Heavy-Haulage Transit Corridor",
  description:
    "Real-time coordination between heavy-haulage transport and wildlife-sensitive corridors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
