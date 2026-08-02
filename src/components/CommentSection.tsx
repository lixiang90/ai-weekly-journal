'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Comment } from '@/types/article';

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '获取评论失败');
      }
      const data = (await res.json()) as Comment[];
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取评论失败');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = (await res.json()) as { error?: string } | Comment;
      if (!res.ok) {
        throw new Error('error' in data ? data.error! : '发表评论失败');
      }

      setComments((prev) => [data as Comment, ...prev]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '发表评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">评论</h2>

      {status === 'loading' ? (
        <div className="text-sm text-muted-foreground">加载中...</div>
      ) : session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={4}
            disabled={submitting}
            className="mb-3"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length}/2000
            </span>
            <Button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? '发表中...' : '发表评论'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-muted rounded-lg text-center">
          <p className="text-sm text-muted-foreground mb-3">
            登录后即可发表评论
          </p>
          <Button onClick={() => signIn('github')}>使用 GitHub 登录</Button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-muted-foreground">加载评论中...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-muted-foreground">暂无评论，快来抢沙发吧！</div>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-4">
              {comment.authorImage ? (
                <Image
                  src={comment.authorImage}
                  alt={comment.authorName}
                  width={40}
                  height={40}
                  className="rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-sm font-medium">
                  {comment.authorName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
