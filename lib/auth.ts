import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import type { User } from "next-auth";


const WORKER_BASE =
  process.env.WORKER_BASE_URL || "https://api.timmytracker.com";


export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

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
  },

  callbacks: {
    async signIn({ user }: { user: User }) {
      if (!user?.email) return false;

      await fetch(`${WORKER_BASE}/api/tarkov/profile/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.email.toLowerCase(),
          email: user.email.toLowerCase(),
          name: user.name ?? null,
          image: (user as any).image ?? null,
        }),
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      return token;
    },

    async session({ session, token }) {
      if (session.user) session.user.email = token.email as string;
      return session;
    },
  },
};
