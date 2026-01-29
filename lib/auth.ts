import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * ✅ Production check
 * Localde cookie domain sorun çıkarmasın diye sadece prod’da açıyoruz
 */
const isProd = process.env.NODE_ENV === "production";

/**
 * ✅ NextAuth config
 * Auth sitesi: auth.timmytracker.com
 * Ana site:   www.timmytracker.com
 *
 * Cookie domain sayesinde login session iki subdomain arasında paylaşılır
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  /**
   * ✅ Important
   */
  secret: process.env.NEXTAUTH_SECRET,

  /**
   * ✅ Session strategy
   * JWT en temiz yöntem
   */
  session: {
    strategy: "jwt",
  },

  /**
   * ✅ Cookie paylaşımı (EN ÖNEMLİ FIX)
   * auth.timmytracker.com login yapınca
   * www.timmytracker.com da aynı session’ı görür
   */
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",

      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",

        /**
         * ✅ HTTPS zorunlu
         */
        secure: isProd,

        /**
         * ✅ subdomain sharing FIX
         * auth + www aynı login session kullanır
         */
        domain: isProd ? ".timmytracker.com" : undefined,
      },
    },
  },

  /**
   * ✅ Callbacks
   * Kullanıcı bilgilerini JWT içine yaz
   */
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },

  /**
   * ✅ Pages override
   * Auth projesinin kendi login ekranı
   */
  pages: {
    signIn: "/sign-in",
  },

  /**
   * ✅ Debug mode
   * İlk testte aç, sonra kapat
   */
  debug: true,
};
