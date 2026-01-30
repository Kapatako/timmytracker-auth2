import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const isProd = process.env.NODE_ENV === "production";
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

    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProd,
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      },
    },

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
    async redirect({ url, baseUrl }) {
      // Her zaman NEXTAUTH_URL (baseUrl) içinde kal
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },

    async jwt({ token, account, profile }) {
      if (profile && "email" in profile) token.email = (profile as any).email;
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

  // debug: !isProd,
};
