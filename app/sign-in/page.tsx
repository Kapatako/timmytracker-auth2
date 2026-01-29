// src/app/sign-in/page.tsx
"use client";
export const dynamic = "force-dynamic";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const DEFAULT_AFTER_LOGIN = "https://www.timmytracker.com/me";

export default function SignInPage() {
  const sp = useSearchParams();

  const callbackUrl = useMemo(() => {
    const cb = sp.get("callbackUrl");
    // boşsa default
    if (!cb) return DEFAULT_AFTER_LOGIN;

    // güvenlik: sadece timmytracker domainlerine izin ver
    try {
      const u = new URL(cb);
      const host = u.hostname.toLowerCase();
      const allowed =
        host === "www.timmytracker.com" ||
        host === "timmytracker.com" ||
        host === "auth.timmytracker.com";

      return allowed ? cb : DEFAULT_AFTER_LOGIN;
    } catch {
      return DEFAULT_AFTER_LOGIN;
    }
  }, [sp]);

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
          Continue with Google to save your builds.
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
      </div>
    </main>
  );
}
