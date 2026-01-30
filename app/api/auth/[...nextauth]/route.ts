import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  // ✅ v4'te host doğruluğu için ENV şart:
  // NEXTAUTH_URL=https://auth.timmytracker.com

  session: { strategy: "jwt" },

  cookies: {
    // ✅ auth + www ortak cookie görsün
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
    async redirect({ url, baseUrl }) {
      const allowed = new Set([
        "https://www.timmytracker.com",
        "https://auth.timmytracker.com",
      ]);

      try {
        const u = new URL(url);
        if (allowed.has(u.origin)) return url;
      } catch {}

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return "https://www.timmytracker.com/me";
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
