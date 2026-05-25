/**
 * NextAuth (Auth.js) configuration.
 *
 * Two ways to sign in:
 *  - Customers: magic email link  → `EmailProvider`
 *  - Staff:     email + password  → `CredentialsProvider` (argon2 hash)
 *
 * Plus Google OAuth when configured.
 *
 * Roles live on `User.role` (CUSTOMER | STAFF | OWNER) and are exposed via
 * the session so the UI can branch on `session.user.role`.
 */
import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import argon2 from "argon2";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    uid?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login?check-email=1",
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 60 * 30, // magic link valid 30 minutes
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "staff-credentials",
      name: "Studio sign-in",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(creds.email).toLowerCase() },
        });
        if (!user || !user.passwordHash) return null;
        if (user.role === "CUSTOMER") return null; // staff only
        const ok = await argon2.verify(user.passwordHash, String(creds.password));
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role;
      } else if (token.uid && !token.role) {
        const u = await prisma.user.findUnique({ where: { id: token.uid as string }, select: { role: true } });
        if (u) token.role = u.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid as string;
        (session.user as any).role = (token.role as Role) ?? "CUSTOMER";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Newly-created accounts default to CUSTOMER (Prisma schema handles this);
      // hook here for future analytics / welcome-email kick-off.
      if (process.env.NODE_ENV !== "production") {
        console.log("new user:", user.email);
      }
    },
  },
};

/** Convenience: read the current session from a server component / route handler. */
export const auth = () => getServerSession(authOptions);
