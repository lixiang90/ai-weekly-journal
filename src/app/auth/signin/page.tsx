'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // 导入 Suspense

// NextAuth 会把失败原因放在 ?error= 里，这里翻译成看得懂的提示
const ERROR_MESSAGES: Record<string, string> = {
  Configuration: '服务器 OAuth 配置有误，请检查 GITHUB_ID / GITHUB_SECRET / NEXTAUTH_URL。',
  AccessDenied: '你取消了授权，或该账号没有登录权限。',
  Verification: '登录链接已失效，请重新登录。',
  OAuthSignin: '无法跳转到 GitHub 授权页面，请稍后重试。',
  OAuthCallback: 'GitHub 回调校验失败，请稍后重试；若持续失败请联系管理员。',
  OAuthCreateAccount: '创建账号失败，请稍后重试。',
  OAuthAccountNotLinked: '该邮箱已通过其他方式登录过，请用原方式登录。',
  Callback: '登录回调处理失败，请稍后重试。',
};

// 将主要内容提取到单独组件中
function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = error
    ? ERROR_MESSAGES[error] ?? '登录失败，请重试。'
    : null;

  const handleGithubSignIn = async () => {
    try {
      await signIn('github', { 
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto mt-10">
        <Card className="w-full space-y-8">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">
              登录 AI丛刊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">{errorMessage}</span>
                  <span className="block mt-1 text-xs text-red-400 break-all">错误代码：{error}</span>
                </div>
              )}
              
              <Button
                className="w-full"
                onClick={handleGithubSignIn}
              >
                使用 GitHub 登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <SignInContent />
    </Suspense>
  );
}