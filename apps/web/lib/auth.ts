import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  debug: true,
  callbacks: {
    async signIn({ user, profile }) {
      const allow = (process.env.ALLOWED_EMAILS || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (allow.length === 0) return true; // no allowlist configured

      const email = (
        (user?.email as string | undefined) ||
        ((profile as any)?.email as string | undefined) ||
        ""
      )
        .trim()
        .toLowerCase();

      return allow.includes(email);
    },
  },
};
