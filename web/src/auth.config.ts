import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.organizationId = (user as { organizationId?: string }).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        (session.user as { organizationId?: string }).organizationId = token.organizationId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
