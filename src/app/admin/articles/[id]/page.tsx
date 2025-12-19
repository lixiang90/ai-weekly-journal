'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const subjournals = ["文史哲", "社科", "理科", "数学"];

export default function EditArticlePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    prompt: '',
    journalId: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  const fetchArticle = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title || '',
          author: data.author || '',
          content: data.content || '',
          prompt: data.prompt || '',
          journalId: data.journal_id !== undefined ? data.journal_id.toString() : '',
        });
      } else {
        alert('获取文章失败');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      alert('获取文章出错');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (session?.user?.role === 'admin' && id) {
      fetchArticle();
    }
  }, [session, id, fetchArticle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          content: formData.content,
          prompt: formData.prompt,
          journalId: parseInt(formData.journalId),
        }),
      });

      if (res.ok) {
        alert('文章更新成功！');
        router.push('/admin');
      } else {
        const errorText = await res.text();
        alert(`更新失败: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating article:', error);
      alert('更新文章出错');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">编辑文章</h1>
          <Button variant="outline" onClick={() => router.push('/admin')}>
            返回列表
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <select 
                name="journalId" 
                className="border rounded px-3 py-2" 
                required
                value={formData.journalId}
                onChange={handleChange}
              >
                <option value="">选择投稿子刊</option>
                {subjournals.map((name, index) => (
                  <option key={index} value={index}>
                    {name} 子刊
                  </option>
                ))}
              </select>

              <Input 
                name="title" 
                placeholder="文章标题" 
                required 
                value={formData.title}
                onChange={handleChange}
              />
              <Input 
                name="author" 
                placeholder="作者署名" 
                required 
                value={formData.author}
                onChange={handleChange}
              />
              <Textarea 
                name="content" 
                placeholder="文章内容" 
                rows={15} 
                required 
                value={formData.content}
                onChange={handleChange}
              />
              <Textarea 
                name="prompt" 
                placeholder="生成文章所用的 Prompt（可选）" 
                rows={4} 
                value={formData.prompt}
                onChange={handleChange}
              />
              
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  保存修改
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push('/admin')}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
