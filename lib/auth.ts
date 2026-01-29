import { NextResponse } from "next/server";

const AUTH_BASE = process.env.AUTH_BASE_URL || "https://auth.timmytracker.com";
const WORKER_BASE = process.env.WORKER_BASE_URL || "https://www.timmytracker.com";

export async function GET(req: Request) {
  // 1) browser cookie'lerini al
  const cookie = req.headers.get("cookie") || "";

  // 2) session'ı SADECE auth subdomain'inden oku
  const sRes = await fetch(`${AUTH_BASE}/api/auth/session`, {
    headers: { cookie },
    cache: "no-store",
  });

  const session = await sRes.json().catch(() => null);
  const email = session?.user?.email?.toLowerCase();

  if (!email) {
    return NextResponse.json({ ok: false, error: "not signed in" }, { status: 401 });
  }

  // 3) worker’dan DB user çek
  const r = await fetch(`${WORKER_BASE}/api/profile/me?email=${encodeURIComponent(email)}`, {
    cache: "no-store",
  });

  const j = await r.json().catch(() => null);
  if (!j?.ok) return NextResponse.json({ ok: false, error: j?.error || "worker error", user: null }, { status: 200 });

  return NextResponse.json({ ok: true, user: j.user || null }, { status: 200 });
}
