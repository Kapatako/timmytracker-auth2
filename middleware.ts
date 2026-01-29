// auth: middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const origin = req.headers.get("origin") || "";
  const allow = origin === "https://www.timmytracker.com" ? origin : "";

  if (allow) {
    res.headers.set("Access-Control-Allow-Origin", allow);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
