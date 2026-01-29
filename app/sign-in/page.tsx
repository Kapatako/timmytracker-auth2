"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#070A12",
        color: "white",
        fontFamily: "system-ui"
      }}
    >
      <div style={{ width: 420 }}>
        <h1 style={{ fontSize: 34, fontWeight: 900 }}>
          TimmyTracker Login
        </h1>

        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Continue with Google to save your builds.
        </p>

        <button
          onClick={() =>
            signIn("google", {
              callbackUrl: "https://www.timmytracker.com/me"
            })
          }
          style={{
            marginTop: 18,
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
