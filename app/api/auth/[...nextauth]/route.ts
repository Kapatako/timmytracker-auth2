import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WWW_ORIGIN = "https://www.timmytracker.com";
const AUTH_ORIGIN = "https://auth.timmytracker.com";

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // jwt strategy OK
  session: { strategy: "jwt" },

  // ✅ Chrome/Opera fix: session cookie subdomainler arasında paylaşılmalı
  // - Domain=.timmytracker.com -> www ve auth ikisi de görebilir
  // - SameSite=None + Secure -> modern tarayıcılar cross-site/cross-subdomain'de cookie gönderir
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
        domain: ".timmytracker.com",
      },
    },

    // csrf token host-only kalsın (domain vermiyoruz)
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },

    // callback-url da host-only kalsın (domain vermiyoruz)
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },
  },

  callbacks: {
    // ✅ token içine email/name/image al (session endpoint boş gelmesin)
    async jwt({ token, profile }) {
      // Google profile geldiğinde token’a bas
      if (profile) {
        // @ts-expect-error - profile tipi provider'a göre değişiyor
        token.email = (profile as any).email ?? token.email;
        // @ts-expect-error
        token.name = (profile as any).name ?? token.name;
        // @ts-expect-error
        token.picture = (profile as any).picture ?? token.picture;
      }
      return token;
    },

    // ✅ session.user alanlarını token’dan doldur
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || session.user.email || null;
        session.user.name = (token.name as string) || session.user.name || null;
        // next-auth user.image
        (session.user as any).image = (token.picture as string) || (session.user as any).image || null;
      }
      return session;
    },

    // ✅ redirect güvenli whitelist
    async redirect({ url, baseUrl }) {
      const allowed = new Set([WWW_ORIGIN, AUTH_ORIGIN]);

      try {
        const u = new URL(url);
        if (allowed.has(u.origin)) return url;
      } catch {
        // url relative ise aşağıda handle edeceğiz
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${WWW_ORIGIN}/me`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
