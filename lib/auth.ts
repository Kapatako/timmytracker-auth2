import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const isProd = process.env.NODE_ENV === "production";

// Prod'da cookie'leri tüm subdomainlerde paylaşmak için şart
const COOKIE_DOMAIN = isProd ? ".timmytracker.com" : undefined;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  // ✅ Kritik: subdomain paylaşımı için cookie domain
  cookies: {
    // Session token cookie: www + auth + diğer subdomainler görebilsin
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd, // prod'da true, localde false
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      },
    },

    // NextAuth callback cookie
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProd,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      },
    },

    // CSRF cookie: __Host- olunca DOMAIN veremezsin (doğru olan bu)
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      // email garanti olsun
      if (profile && "email" in profile) token.email = (profile as any).email;

      // provider bilgisi (opsiyonel)
      if (account?.provider) (token as any).provider = account.provider;

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token?.email) session.user.email = token.email as string;
        (session.user as any).provider = (token as any).provider ?? "google";
      }
      return session;
    },
  },

  // İstersen debug:
  // debug: !isProd,
};
