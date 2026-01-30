import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_BASE = process.env.AUTH_BASE_URL || "https://auth.timmytracker.com";

async function proxy(req: NextRequest) {
  const url = new URL(req.url);

  // upstream hedef
  const target = new URL(AUTH_BASE);
  target.pathname = url.pathname;
  target.search = url.search;

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  const upstream = await fetch(target.toString(), {
    method: req.method,
    redirect: "manual",
    cache: "no-store",
    headers: {
      // client headers
      cookie: req.headers.get("cookie") || "",
      "content-type": req.headers.get("content-type") || "",
      accept: req.headers.get("accept") || "*/*",
      "accept-language": req.headers.get("accept-language") || "",
      "user-agent": req.headers.get("user-agent") || "",

      // ✅ KRİTİK: auth sunucusuna "sanki www üzerinden gelmiş" gibi söyle
      // NextAuth URL üretirken bunlara bakıyor.
      "x-forwarded-host": "www.timmytracker.com",
      "x-forwarded-proto": "https",
      "x-forwarded-port": "443",
      origin: "https://www.timmytracker.com",
      referer: "https://www.timmytracker.com" + (url.pathname || "/"),
    },
    body,
  });

  const resBody = await upstream.arrayBuffer();
  const res = new NextResponse(resBody, { status: upstream.status });

  // headers pass-through (set-cookie hariç)
  upstream.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "set-cookie") return;
    res.headers.set(k, v);
  });

  // ✅ Set-Cookie’leri taşı (node runtime’da bazen getSetCookie yok)
  const rawSetCookie = upstream.headers.get("set-cookie");
  if (rawSetCookie) {
    // birden fazla set-cookie olabilir; append ile taşımak daha güvenli
    res.headers.append("set-cookie", rawSetCookie);
  }

  return res;
}

export async function GET(req: NextRequest) { return proxy(req); }
export async function POST(req: NextRequest) { return proxy(req); }
export async function PUT(req: NextRequest) { return proxy(req); }
export async function PATCH(req: NextRequest) { return proxy(req); }
export async function DELETE(req: NextRequest) { return proxy(req); }
