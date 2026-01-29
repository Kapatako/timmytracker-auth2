"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Sign in</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "https://www.timmytracker.com/me" })}
        style={{ padding: 12, marginTop: 12 }}
      >
        Continue with Google
      </button>
    </main>
  );
}
