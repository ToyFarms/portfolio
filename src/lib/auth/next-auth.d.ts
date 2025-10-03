import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role?: "user" | "admin" | string;
    tokenVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      role?: "user" | "admin" | string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    email?: string;
    name?: string;
    image?: string;
    role?: "user" | "admin" | string;
    tokenVersion?: number;
    iat?: number;
    revoked?: boolean;
  }
}
