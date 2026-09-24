import { NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

// 将你的 GitHub 用户名替换到这里
const ADMIN_GITHUB_USERNAME = 'lixiang90';

/**
 * GitHub 在 2026 年 4 月开始实施 RFC 9207（OAuth 2.0 Authorization Server
 * Issuer Identification），会在授权回调里附带 `iss=https://github.com/login/oauth`。
 * openid-client（next-auth v4 内部使用）一旦发现 `iss`，就会拿它和 provider 的
 * `issuer` 做严格字符串比较；如果 provider 没有配置 `issuer`，就会直接抛出
 * `issuer must be configured on the issuer`，导致 GitHub 登录全部失败。
 *
 * next-auth >= 4.24.12 的 GitHub provider 已经内置了正确的 issuer，
 * 这里只在（例如被锁定到旧版本时）provider 自身没有 issuer 的情况下兜底补上，
 * 避免覆盖上游未来可能更新的值。
 */
const GITHUB_ISSUER = 'https://github.com/login/oauth';

const githubProvider = GithubProvider({
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
});

if (!githubProvider.issuer) {
  githubProvider.issuer = GITHUB_ISSUER;
}

export const authOptions: NextAuthOptions = {
  providers: [githubProvider],
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
  // 只在本地开发时输出调试日志，生产环境仍会打印错误
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
  },
}; 