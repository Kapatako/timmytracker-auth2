"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInClient() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "https://www.timmytracker.com/me";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#070A12", color: "white" }}>
      <div style={{ width: 420 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>TimmyTracker Login</h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>Continue with Google.</p>

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
