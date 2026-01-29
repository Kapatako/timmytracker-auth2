// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const isProd = process.env.NODE_ENV === "production";

// www'ye dönmek istiyorsun (default)
const DEFAULT_AFTER_LOGIN = "https://www.timmytracker.com/me";

export const authOptions: NextAuthOptions = {
  // Vercel/Reverse proxy arkasında stabil olsun
  trustHost: true,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],

  // DB kullanmıyorsan JWT
  session: { strategy: "jwt" },

  // ✅ ÖNEMLİ: Cookie domain'i ".timmytracker.com" yap -> www + auth ortak okur.
  // ✅ secure: prod'da true
  // ✅ sameSite: lax (OAuth için genelde doğru)
  cookies: {
    sessionToken: {
      name: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: isProd ? ".timmytracker.com" : undefined,
      },
    },
    callbackUrl: {
      name: isProd ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: isProd ? ".timmytracker.com" : undefined,
      },
    },
    csrfToken: {
      name: isProd ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        // __Host- cookie'de domain OLMAZ, o yüzden burada domain koymuyoruz.
      },
    },
  },

  callbacks: {
    // ✅ Burada "auth'a dönme" problemini kesiyoruz:
    // - NextAuth bazen callback-url cookie'yi auth origin'e set ediyor
    // - redirect callback ile sadece izin verdiğimiz yerlere gitsin
    async redirect({ url, baseUrl }) {
      // baseUrl = NEXTAUTH_URL (auth.timmytracker.com olmalı)
      // ama biz login sonrası www'ye gitmek istiyoruz.

      // 1) Relative url geldiyse -> auth içinde kalsın
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // 2) Aynı origin ise (auth.timmytracker.com) -> aynen
      try {
        const u = new URL(url);

        // ✅ sadece timmytracker.com alanlarına izin ver
        const host = u.hostname.toLowerCase();

        const allowed =
          host === "www.timmytracker.com" ||
          host === "timmytracker.com" ||
          host === "auth.timmytracker.com";

        if (!allowed) return DEFAULT_AFTER_LOGIN;

        // Eğer auth'a dönüyorsa ama kullanıcı www istiyorsa:
        // callbackUrl yoksa default'u zorla
        if (host === "auth.timmytracker.com") {
          return DEFAULT_AFTER_LOGIN;
        }

        return url;
      } catch {
        return DEFAULT_AFTER_LOGIN;
      }
    },

    async jwt({ token, account, profile }) {
      // Google ilk girişte token'a email vs eklemek istersen:
      if (account?.provider === "google") {
        // token.email zaten oluyor genelde ama garanti edelim
        const anyProfile = profile as any;
        token.email = token.email || anyProfile?.email;
        token.name = token.name || anyProfile?.name;
        token.picture = token.picture || anyProfile?.picture;
      }
      return token;
    },

    async session({ session, token }) {
      // session.user.email vs garanti
      if (session.user) {
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
        (session.user as any).image = (token as any).picture || (session.user as any).image;
      }
      return session;
    },
  },

  // ✅ Kendi sign-in sayfan auth projesinde olacak
  pages: {
    signIn: "/sign-in",
  },

  // debug istersen:
  // debug: true,
};
