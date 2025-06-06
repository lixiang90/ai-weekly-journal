'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const subjournals = ["文史哲", "社科", "理科", "数学"];

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">投稿文章</h1>
        <Card>
          <CardContent className="p-6">
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const data = {
                  title: (form.title as HTMLInputElement).value,
                  author: (form.author as HTMLInputElement).value,
                  content: (form.content as HTMLTextAreaElement).value,
                  prompt: (form.prompt as HTMLTextAreaElement).value,
                  journalId: parseInt((form.journalId as HTMLSelectElement).value),
                };

                const res = await fetch("/api/admin/articles", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });

                if (res.ok) {
                  alert("投稿成功！请等待管理员审核。");
                  router.push('/');
                } else {
                  alert("投稿失败");
                }
              }}
            >
              <select name="journalId" className="border rounded px-3 py-2" required>
                <option value="">选择投稿子刊</option>
                {subjournals.map((name, index) => (
                  <option key={index} value={index}>
                    {name} 子刊
                  </option>
                ))}
              </select>

              <Input name="title" placeholder="文章标题" required />
              <Input name="author" placeholder="作者署名（如：张三 + ChatGPT）" required />
              <Textarea name="content" placeholder="文章内容" rows={8} required />
              <Textarea name="prompt" placeholder="生成文章所用的 Prompt（可选）" rows={4} />
              <Button type="submit" className="w-full">
                提交投稿
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 