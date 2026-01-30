import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const keys = [
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "NODE_ENV",
  ] as const;

  // secretları göstermeden var mı yok mu kontrol ediyoruz
  const safe = Object.fromEntries(
    keys.map((k) => {
      const v = process.env[k];
      if (!v) return [k, "MISSING"];
      if (k.includes("SECRET")) return [k, `SET(len=${v.length})`];
      if (k.includes("CLIENT")) return [k, `SET(len=${v.length})`];
      return [k, v];
    })
  );

  return NextResponse.json({ ok: true, env: safe });
}
