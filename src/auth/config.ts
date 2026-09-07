import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import BosBase from "bosbase";
import { syncUserToBosbase } from "@/lib/bosbase/sync-user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Local admin",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        const allowedEmails = (process.env.BOSBASE_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
        if (!email || !password || !allowedEmails.includes(email) || !process.env.BOSBASE_URL) return null;
        try {
          const client = new BosBase(process.env.BOSBASE_URL);
          const admin = await client.admins.authWithPassword(email, password);
          return { id: admin.record.id, email: admin.record.email, name: admin.record.name || email };
        } catch {
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV === "development",
  pages: { signIn: "/en/auth/signin" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          await syncUserToBosbase({ id: user.id || account.providerAccountId, email: user.email, name: user.name || profile?.name, image: user.image || profile?.picture });
        } catch (error) {
          console.error("Failed to sync user to Bosbase during sign in:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      if (token?.bosbaseUserId) (session.user as any).bosbaseUserId = token.bosbaseUserId;
      return session;
    },
    async jwt({ token, user, account, trigger }) {
      if (user) token.id = user.id;
      if (trigger === "signIn" && account?.provider === "google" && user?.email) {
        try {
          const bosbaseUserId = await syncUserToBosbase({ id: user.id || account.providerAccountId, email: user.email, name: user.name || undefined, image: user.image || undefined });
          if (bosbaseUserId) token.bosbaseUserId = bosbaseUserId;
        } catch (error) {
          console.error("Failed to sync user to BosBase during JWT creation:", error);
        }
      }
      return token;
    },
  },
});

