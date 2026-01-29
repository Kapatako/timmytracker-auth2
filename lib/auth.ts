// auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
// Discord kullanıyorsan aç:
// import Discord from "next-auth/providers/discord";

/**
 * IMPORTANT:
 * - auth.timmytracker.com üzerinde login oluyorsun
 * - www.timmytracker.com da session görebilsin diye cookie domain'i .timmytracker.com olmalı
 */
const COOKIE_DOMAIN = ".timmytracker.com";
const IS_PROD = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  // ✅ şart: auth ile www aynı NEXTAUTH_SECRET kullanmalı
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Discord kullanıyorsan:
    // Discord({
    //   clientId: process.env.DISCORD_CLIENT_ID!,
    //   clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    // }),
  ],

  session: {
    strategy: "jwt",
  },

  /**
   * ✅ Kritik: Cookie domain'i
   * - session cookie'si www'de de okunabilsin
   * - csrfToken cookie'si __Host olduğu için domain alamaz (kalsın)
   */
  cookies: {
    sessionToken: {
      // prod'da __Secure- olmalı
      name: IS_PROD
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: IS_PROD,
        domain: COOKIE_DOMAIN,
      },
    },

    callbackUrl: {
      name: IS_PROD
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: IS_PROD,
        domain: COOKIE_DOMAIN,
      },
    },

    // __Host- cookie domain alamaz → doğru olan bu şekilde bırakmak
    csrfToken: {
      name: IS_PROD
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: IS_PROD,
        // domain YOK
      },
    },
  },

  /**
   * (Opsiyonel ama önerilir)
   * Login sonrası default yönlendirme kontrolü.
   */
  callbacks: {
    async redirect({ url, baseUrl }) {
      // sadece kendi domainlerine izin ver
      try {
        const u = new URL(url);
        if (u.hostname.endsWith("timmytracker.com")) return url;
      } catch {}
      return baseUrl;
    },

    async jwt({ token, account, profile }) {
      // ilk login anında provider bilgisi (istersen kullanırsın)
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      // session.user içine token bilgisi koymak istersen:
      if (session?.user) {
        (session.user as any).provider = (token as any).provider || null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
