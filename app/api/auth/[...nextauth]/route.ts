import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTH_BASE = process.env.AUTH_BASE_URL || "https://auth.timmytracker.com";
const LOOP_HEADER = "x-tt-proxy-hop";

async function proxy(req: NextRequest) {
  // ✅ Loop guard: bir kez proxy'lendiyse tekrar proxy'leme
  const hop = Number(req.headers.get(LOOP_HEADER) || "0");
  if (hop >= 1) {
    return NextResponse.json(
      { ok: false, error: "Proxy loop detected", hop },
      { status: 508 }
    );
  }

  const url = new URL(req.url);
  const target = new URL(AUTH_BASE);
  target.pathname = url.pathname;
  target.search = url.search;

  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.arrayBuffer();

  // ✅ Gerçek host/proto'yu al (elle www zorlamıyoruz)
  const reqHost = req.headers.get("host") || "www.timmytracker.com";
  const xfProto = req.headers.get("x-forwarded-proto") || "https";

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

      // ✅ NextAuth için kritik: dış dünyadaki url bilgisi
      "x-forwarded-host": reqHost,
      "x-forwarded-proto": xfProto,

      // ✅ origin / referer'i elle set etme; varsa geçir, yoksa boş bırak
      origin: req.headers.get("origin") || "",
      referer: req.headers.get("referer") || "",

      // ✅ loop header ekle
      [LOOP_HEADER]: String(hop + 1),
    },
    body,
  });

  const resBody = await upstream.arrayBuffer();
  const res = new NextResponse(resBody, { status: upstream.status });

  upstream.headers.forEach((v, k) => {
    const key = k.toLowerCase();
    if (key === "set-cookie") return;
    res.headers.set(k, v);
  });

  // set-cookie forwarding (basit)
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) res.headers.append("set-cookie", setCookie);

  return res;
}

export async function GET(req: NextRequest) { return proxy(req); }
export async function POST(req: NextRequest) { return proxy(req); }
export async function PUT(req: NextRequest) { return proxy(req); }
export async function PATCH(req: NextRequest) { return proxy(req); }
export async function DELETE(req: NextRequest) { return proxy(req); }
