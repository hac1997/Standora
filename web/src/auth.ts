import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import Database from "better-sqlite3";
import path from "path";

type DbUser = {
  id: string;
  name: string;
  email: string;
  password: string | null;
  role: string;
  organizationId: string | null;
};

function getUser(email: string): DbUser | undefined {
  const db = new Database(path.resolve(process.cwd(), "dev.db"), { readonly: true });
  try {
    return db.prepare("SELECT id, name, email, password, role, organizationId FROM User WHERE email = ?").get(email) as DbUser | undefined;
  } finally {
    db.close();
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = getUser(credentials.email as string);

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
});
