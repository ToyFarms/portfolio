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
  session: { strategy: "jwt" },
  jwt: {},
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.role = user.role || "user";
        token.userId = user.id?.toString();
        token.image = user.image;
        token.tokenVersion = user.tokenVersion ?? 0;
        return token;
      }

      if (token.userId) {
        await connectDB();
        const dbUser = await User.findById(token.userId).lean();

        if (!dbUser) {
          return { ...token, revoked: true };
        }

        if ((dbUser.tokenVersion ?? 0) !== (token.tokenVersion ?? 0)) {
          return { ...token, revoked: true };
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && (token as any).revoked) {
        return { ...session } as unknown as Session;
      }

      session.user = session.user || ({} as any);
      session.user.role = token.role as any;
      session.user.image = token.image as any;
      session.user.id = token.userId as string | undefined;

      return session;
    },
  },
});
