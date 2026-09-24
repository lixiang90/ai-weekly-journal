/**
 * RFC 9207 回归检查 —— GitHub 登录为什么会挂，以及现在为什么不会挂。
 *
 * 背景：GitHub 从 2026 年 4 月起在 OAuth 授权回调里返回
 *   iss=https://github.com/login/oauth
 * next-auth v4 内部的 openid-client 在 `client.callback()` 里做这件事：
 *
 *   if ('iss' in params) {
 *     assertIssuerConfiguration(this.issuer, 'issuer');   // 没配 issuer -> 直接抛错
 *     if (params.iss !== this.issuer.issuer) throw ...    // 配错 issuer -> iss mismatch
 *   }
 *
 * 所以只要 GitHub provider 没有 issuer，所有登录都会以
 * `[next-auth][error][OAUTH_CALLBACK_ERROR] issuer must be configured on the issuer`
 * 收场。
 *
 * 这个脚本用真实的 openid-client 走一遍上面的判断（在换 token 之前就停下来，
 * 不会发任何网络请求），断言：
 *   1. 项目里实际会被使用的 GitHub provider 带着正确的 issuer；
 *   2. 带 iss 的回调能通过校验；
 *   3. 旧的「没有 issuer」配置确实会失败（防止有人把修复删掉）。
 *
 * 运行：npm run check:auth
 */

const { Issuer } = require('openid-client');
const GithubProvider = require('next-auth/providers/github').default;

// GitHub 在授权回调里实际发送的 iss 值（RFC 9207）
const GITHUB_ISS = 'https://github.com/login/oauth';

const endpoint = (value) => (typeof value === 'string' ? value : value && value.url);

/** 复刻 next-auth 的 core/lib/oauth/client.js：由 provider 配置造出 openid-client 的 client */
function clientFor(provider) {
  const issuer = new Issuer({
    issuer: provider.issuer,
    authorization_endpoint: endpoint(provider.authorization),
    token_endpoint: endpoint(provider.token),
    userinfo_endpoint: endpoint(provider.userinfo),
  });

  return new issuer.Client({
    client_id: 'test-client-id',
    client_secret: 'test-client-secret',
    redirect_uris: ['http://localhost:3000/api/auth/callback/github'],
  });
}

/**
 * 跑一遍回调校验。params 里带 error 是为了在 iss 校验之后、
 * 真正请求 token endpoint 之前停下来（openid-client 的判断顺序：
 * state -> iss -> error -> token 交换）。
 */
async function runCallback(provider, iss) {
  const client = clientFor(provider);
  const params = { state: 'state-value', error: 'stop_before_token_exchange' };
  if (iss !== undefined) params.iss = iss;

  try {
    await client.callback('http://localhost:3000/api/auth/callback/github', params, {
      state: 'state-value',
    });
    return { ok: true, message: 'no error' };
  } catch (err) {
    // OPError(stop_before_token_exchange) 说明 iss 校验已经通过了
    if (err.error === 'stop_before_token_exchange') return { ok: true, message: 'iss 校验通过' };
    return { ok: false, message: err.message };
  }
}

async function main() {
  const failures = [];
  const check = (name, condition, detail) => {
    console.log(`${condition ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
    if (!condition) failures.push(name);
  };

  // 项目里真实使用的 provider（和 src/lib/auth.ts 保持一致的兜底逻辑）
  const provider = GithubProvider({ clientId: 'id', clientSecret: 'secret' });
  if (!provider.issuer) provider.issuer = GITHUB_ISS;

  console.log(`next-auth GitHub provider issuer: ${provider.issuer}`);
  check('provider 的 issuer 等于 GitHub 实际发送的 iss', provider.issuer === GITHUB_ISS);

  const withIss = await runCallback(provider, GITHUB_ISS);
  check('带 iss 的回调被接受', withIss.ok, withIss.message);

  const withoutIss = await runCallback(provider, undefined);
  check('不带 iss 的旧回调仍然被接受（向后兼容）', withoutIss.ok, withoutIss.message);

  const wrongIss = await runCallback(provider, 'https://evil.example.com');
  check('伪造的 iss 被拒绝（mix-up 攻击防护生效）', !wrongIss.ok, wrongIss.message);

  // 回归：把 issuer 去掉，就是线上挂掉时的配置
  const brokenProvider = GithubProvider({ clientId: 'id', clientSecret: 'secret' });
  delete brokenProvider.issuer;
  const broken = await runCallback(brokenProvider, GITHUB_ISS);
  check(
    '没有 issuer 时确实会复现线上的报错',
    !broken.ok && /issuer must be configured/.test(broken.message),
    broken.message
  );

  if (failures.length) {
    console.error(`\n${failures.length} 项检查未通过`);
    process.exit(1);
  }
  console.log('\n全部检查通过：GitHub 的 RFC 9207 iss 参数不会再让登录失败。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
