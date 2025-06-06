'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // 导入 Suspense

// 将主要内容提取到单独组件中
function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
                  <span className="block sm:inline">登录失败，请重试</span>
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