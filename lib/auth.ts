// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const isProd = process.env.NODE_ENV === "production";

/**
 * IMPORTANT:
 * - Cookie override KULLANMIYORUZ.
 * - Proxy / subdomain / callback karmaşasında en stabil yaklaşım budur.
 * - NEXTAUTH_URL mutlaka https://www.timmytracker.com olmalı (auth projesinde).
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * NextAuth bazen dışarıya açık redirect alabilir.
     * Biz sadece kendi origin'imiz içinde kalalım.
     *
     * baseUrl = NEXTAUTH_URL (auth projesindeki env)
     * Bu da https://www.timmytracker.com olmalı.
     */
    async redirect({ url, baseUrl }) {
      // /me gibi relative ise baseUrl içine al
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // absolute ise sadece aynı origin'e izin ver
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {
        // ignore
      }

      // aksi halde ana sayfaya dön
      return baseUrl;
    },

    async jwt({ token, account, profile }) {
      // email garanti olsun
      const p = profile as any;
      if (p?.email) token.email = p.email;

      // provider info (opsiyonel)
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

  /**
   * Prod’da debug kapalı kalsın.
   * Sorun ararken true yapabilirsin.
   */
  // debug: !isProd,
};
