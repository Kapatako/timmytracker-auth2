// lib/authClient.ts
export const AUTH_ORIGIN = "https://auth.timmytracker.com";
export const WWW_ORIGIN = "https://www.timmytracker.com";

export type AuthSession =
  | null
  | {
      user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
      };
      expires?: string;
    };

export async function fetchAuthSession(): Promise<AuthSession> {
  const r = await fetch(`${AUTH_ORIGIN}/api/auth/session`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  // next-auth session endpoint bazen 200 + {} döner
  const j = await r.json().catch(() => null);
  if (!j || typeof j !== "object") return null;

  // next-auth: logged out => {}
  if (!("user" in j)) return null;
  return j as AuthSession;
}

export function goSignIn(callbackPath = "/me") {
  const callbackUrl = `${WWW_ORIGIN}${callbackPath}`;
  const url = `${AUTH_ORIGIN}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  window.location.href = url;
}

// next-auth signout aslında CSRF ister (POST).
// Bu helper bunu doğru şekilde yapar.
export async function signOutViaAuth(callbackPath = "/") {
  const callbackUrl = `${WWW_ORIGIN}${callbackPath}`;

  // 1) csrf al
  const csrfRes = await fetch(`${AUTH_ORIGIN}/api/auth/csrf`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  const csrfJson = await csrfRes.json().catch(() => null);
  const csrfToken = csrfJson?.csrfToken;
  if (!csrfToken) {
    // fallback: hiç uğraşmadan auth signout sayfasına gönder
    window.location.href = `${AUTH_ORIGIN}/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    return;
  }

  // 2) POST signout
  const form = new URLSearchParams();
  form.set("csrfToken", csrfToken);
  form.set("callbackUrl", callbackUrl);

  await fetch(`${AUTH_ORIGIN}/api/auth/signout`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
    redirect: "follow",
  });

  // 3) www’ye dön
  window.location.href = callbackUrl;
}
