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

  session: { strategy: "jwt" },

  // ✅ Chrome/Opera fix: cookie’yi .timmytracker.com domaininde paylaş
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

    // csrf host-only kalsın
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      },
    },

    // callback-url host-only kalsın (çakışma azaltır)
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
    // ✅ token içine email/name/image bas
    async jwt({ token, profile }) {
      if (profile) {
        const p = profile as any;
        token.email = p.email ?? token.email;
        token.name = p.name ?? token.name;
        token.picture = p.picture ?? token.picture;
      }
      return token;
    },

    // ✅ session.user alanlarını token’dan doldur
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) || null;
        session.user.name = (token.name as string) || null;
        (session.user as any).image = (token.picture as string) || null;
      }
      return session;
    },

    // ✅ redirect whitelist
    async redirect({ url, baseUrl }) {
      const allowed = new Set([WWW_ORIGIN, AUTH_ORIGIN]);

      try {
        const u = new URL(url);
        if (allowed.has(u.origin)) return url;
      } catch {
        // relative url olabilir
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${WWW_ORIGIN}/me`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
