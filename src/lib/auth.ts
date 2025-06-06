import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

// 将你的 GitHub 用户名替换到这里
const ADMIN_GITHUB_USERNAME = 'lixiang90';

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          login: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // 检查是否是管理员
        const isAdmin = user.login === ADMIN_GITHUB_USERNAME;
        return {
          ...token,
          role: isAdmin ? 'admin' : 'user',
          login: user.login,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.login = token.login;
      }
      return session;
    },
  },
  debug: true,
  session: {
    strategy: "jwt",
  },
}; 