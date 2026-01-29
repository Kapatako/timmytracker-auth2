import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  // ✅ TEK SCOPE: .timmytracker.com (main de görsün)
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
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
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
  },

  callbacks: {
    async jwt({ token, profile }) {
      if (profile && "email" in profile) token.email = String(profile.email || "").toLowerCase();
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.email) session.user.email = token.email as string;
      return session;
    },
  },
};
