// lib/auth.ts  (AUTH projesi)
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const WWW = "https://www.timmytracker.com";
const AUTH = "https://auth.timmytracker.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  // IMPORTANT: cross-subdomain cookie
  const cookieDomain = ".timmytracker.com";

export const authOptions = {
  // providers: [...]
  // secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      // prod'da secure cookie kullan
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: cookieDomain,
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: cookieDomain,
      },
    },
    // __Host- cookie domain alamaz, aynen bırakıyoruz:
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: ".timmytracker.com",
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },

  callbacks: {
    async jwt({ token, profile }) {
      if (profile && (profile as any).email) token.email = (profile as any).email;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token?.email) (session.user as any).email = token.email;
      return session;
    },

    // 🔥 BU OLMAZSA HEP AUTH'A DÖNER
    async redirect({ url }) {
      // 1) relative URL gelirse www’ye çevir
      if (url.startsWith("/")) return `${WWW}${url}`;

      // 2) sadece www origin’ine izin ver
      try {
        const u = new URL(url);
        if (u.origin === WWW) return u.toString();
      } catch {}

      // 3) diğer her şeyi güvenli default’a at
      return `${WWW}/me`;
    },
  },
};
