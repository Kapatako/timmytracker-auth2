// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const must = (key: string) => {
  const v = process.env[key];
  if (!v || !v.trim()) throw new Error(`MISSING_ENV:${key}`);
  return v.trim();
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: must("GOOGLE_CLIENT_ID"),
      clientSecret: must("GOOGLE_CLIENT_SECRET"),
    }),
  ],

  secret: must("NEXTAUTH_SECRET"),
  session: { strategy: "jwt" },

  // ✅ Debug açık (prod'da da) — hata görünsün diye
  debug: true,

  callbacks: {
    async redirect({ url, baseUrl }) {
      // baseUrl = NEXTAUTH_URL'den gelir (bu projede)
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },

    async jwt({ token, account, profile }) {
      const p = profile as any;
      if (p?.email) token.email = p.email;
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
};
