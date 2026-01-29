"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function safeCallback(raw: string | null) {
  // default hedef
  const fallback = "https://www.timmytracker.com/me";
  if (!raw) return fallback;

  try {
    // URL decode + parse
    const decoded = decodeURIComponent(raw);
    const u = new URL(decoded);

    // SADECE www.timmytracker.com’a izin ver
    if (u.origin === "https://www.timmytracker.com") return u.toString();

    return fallback;
  } catch {
    // "/me" gibi relative gelirse
    if (raw.startsWith("/")) return `https://www.timmytracker.com${raw}`;
    return fallback;
  }
}

function SignInInner() {
  const sp = useSearchParams();

  // main’den gelen callbackUrl paramı
  const callbackUrl = useMemo(() => safeCallback(sp.get("callbackUrl")), [sp]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#070A12",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ width: 420 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>TimmyTracker Login</h1>

        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Continue with Google to sign in.
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Continue with Google
        </button>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
          Redirecting to: <span style={{ opacity: 0.9 }}>{callbackUrl}</span>
        </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  // useSearchParams suspense ister (Vercel build hatası yememek için)
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
