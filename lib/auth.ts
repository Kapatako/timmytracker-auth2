// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const WORKER_BASE = process.env.WORKER_BASE_URL || "https://www.timmytracker.com";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  // subdomain cookie paylaşımı
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: ".timmytracker.com",
      },
    },
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
    async jwt({ token, profile, user }) {
      // token’a email / name / image bas
      if (user?.email) token.email = user.email;
      if (user?.name) token.name = user.name;
      if ((user as any)?.image) token.picture = (user as any).image;

      if (profile && "email" in profile) token.email = (profile as any).email;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token?.email) session.user.email = token.email as string;
        if (token?.name) session.user.name = token.name as string;
        if ((token as any)?.picture) (session.user as any).image = (token as any).picture as string;
      }
      return session;
    },
  },

  // ✅ KRİTİK: Login olunca Worker’a upsert at
  events: {
    async signIn({ user }) {
      try {
        const email = (user?.email || "").toLowerCase().trim();
        if (!email) return;

        // NextAuth bazen id vermeyebilir → email’i id gibi kullan
        const id = (user as any)?.id ? String((user as any).id) : email;

        await fetch(`${WORKER_BASE}/api/profile/upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            email,
            name: user?.name || null,
            image: (user as any)?.image || null,
          }),
          cache: "no-store",
        });
      } catch {
        // sessiz geç (login’i bozmasın)
      }
    },
  },
};
