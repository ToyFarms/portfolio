// ...imports unchanged
import NextAuth, { Session, User as NextUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { AuthUser } from "@/lib/auth/types";
import { credentialsSchema, LoginCredentials } from "@/lib/auth/schema";
import { JWT } from "next-auth/jwt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials ?? {});
        if (!parsed.success) return null;

        const { email, password } = parsed.data as LoginCredentials;

        await connectDB();
        const user = await User.findOne({ email }).lean();
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || "user",
          image: user.image,
          tokenVersion: user.tokenVersion ?? 0,
        } as AuthUser & { tokenVersion: number };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({
      token,
      user,
      trigger,
    }: {
      token: JWT;
      user?: any;
      trigger?: string;
    }) {
      if (user) {
        return {
          ...token,
          userId: user.id?.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || "user",
          tokenVersion: user.tokenVersion ?? 0,
          iat: Math.floor(Date.now() / 1000),
        };
      }

      if (token.userId) {
        await connectDB();
        const dbUser = await User.findById(token.userId).lean();

        if (!dbUser) {
          return { ...token, revoked: true };
        }

        if ((dbUser.tokenVersion ?? 0) !== (token.tokenVersion ?? 0)) {
          return {
            ...token,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
            role: dbUser.role || "user",
            tokenVersion: dbUser.tokenVersion ?? 0,
            iat: Math.floor(Date.now() / 1000),
          };
        }

        if (trigger === "update") {
          return {
            ...token,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
            role: dbUser.role || "user",
            tokenVersion: dbUser.tokenVersion ?? 0,
            iat: Math.floor(Date.now() / 1000),
          };
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && (token as any).revoked) {
        return null as any;
      }

      session.user = session.user || ({} as any);
      session.user.id = token.userId as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.image = token.image as string;
      session.user.role = token.role as any;

      return session;
    },
  },
});
