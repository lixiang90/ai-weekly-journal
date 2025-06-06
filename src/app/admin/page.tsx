'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  prompt?: string;
  journalId: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchArticles();
    }
  }, [session]);

  const fetchArticles = async () => {
    const res = await fetch('/api/admin/articles');
    if (res.ok) {
      const data = await res.json();
      // 过滤掉已通过的文章，并按时间倒序排列
      const filteredArticles = data
        .filter((article: Article) => article.status !== 'approved')
        .sort((a: Article, b: Article) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      setArticles(filteredArticles);
    }
  };

  const handleArticleStatus = async (articleId: string, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/articles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: articleId, status }),
    });

    if (res.ok) {
      fetchArticles();
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">管理后台</h1>
        
        <div className="grid gap-6">
          {articles.length === 0 ? (
            <p className="text-gray-500">暂无待审核的文章</p>
          ) : (
            articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        <Link 
                          href={`/subjournal/${article.journalId}/${article.id}`}
                          className="hover:text-blue-600"
                        >
                          {article.title}
                        </Link>
                      </CardTitle>
                      <div className="text-sm text-gray-500">
                        作者: {article.author} | 投稿时间: {new Date(article.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleArticleStatus(article.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        通过
                      </Button>
                      <Button
                        onClick={() => handleArticleStatus(article.id, 'rejected')}
                        variant="destructive"
                      >
                        拒绝
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none mb-4">
                    <p>{article.content.substring(0, 200)}...</p>
                  </div>
                  {article.prompt && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">Prompt:</h4>
                      <p className="text-sm text-gray-600">{article.prompt}</p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Link 
                      href={`/subjournal/${article.journalId}/${article.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      查看文章详情 →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
} 