import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const serverApiUrl =
  process.env.INTERNAL_API_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone Number", type: "text", placeholder: "Enter your phone number" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        try {
          const res = await fetch(`${serverApiUrl}/api/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              phone: credentials.phone,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const raw = await res.text();
          let data: any = null;
          try {
            data = raw ? JSON.parse(raw) : null;
          } catch (parseError) {
            console.error("Auth error: non-JSON response", {
              status: res.status,
              body: raw?.slice(0, 200),
            });
          }

          if (res.ok && data?.access_token) {
            // Fetch user info with the token
            const userRes = await fetch(`${serverApiUrl}/api/auth/me`, {
              headers: { "Authorization": `Bearer ${data.access_token}` },
            });
            const userRaw = await userRes.text();
            const userData = userRaw ? JSON.parse(userRaw) : null;
            
            if (userRes.ok) {
              return {
                id: userData.id,
                name: userData.name,
                role: userData.role,
                phone: userData.phone,
                accessToken: data.access_token,
              };
            }
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.accessToken = (user as any).accessToken;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).phone = token.phone;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-key-for-local-dev-12345"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
