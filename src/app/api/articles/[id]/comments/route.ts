import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import type { Comment } from '@/types/article';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CommentRow {
  id: string;
  article_id: string;
  author_name: string;
  author_image: string | null;
  author_login: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

function toCamelCase(row: CommentRow): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    authorName: row.author_name,
    authorImage: row.author_image || undefined,
    authorLogin: row.author_login,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

// 获取文章的评论列表
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { data: article, error: articleError } = await supabaseAdmin
    .from('articles')
    .select('status')
    .eq('id', id)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  if (article.status !== 'approved') {
    return NextResponse.json({ error: '文章未发布' }, { status: 403 });
  }

  const { data: comments, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .eq('article_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }

  return NextResponse.json(((comments as CommentRow[] | null) || []).map(toCamelCase));
}

// 发表评论
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.login) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!content) {
    return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: '评论内容不能超过 2000 字' }, { status: 400 });
  }

  const { data: article, error: articleError } = await supabaseAdmin
    .from('articles')
    .select('status')
    .eq('id', id)
    .single();

  if (articleError || !article) {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 });
  }

  if (article.status !== 'approved') {
    return NextResponse.json({ error: '该文章暂不允许评论' }, { status: 403 });
  }

  const { data: inserted, error } = await supabaseAdmin
    .from('comments')
    .insert({
      article_id: id,
      author_name: session.user.name || session.user.login,
      author_image: session.user.image,
      author_login: session.user.login,
      content,
    })
    .select('*');

  if (error) {
    console.error('发表评论失败:', error);
    return NextResponse.json({ error: '发表评论失败' }, { status: 500 });
  }

  if (!inserted || inserted.length === 0) {
    return NextResponse.json({ error: '发表评论失败' }, { status: 500 });
  }

  return NextResponse.json(toCamelCase(inserted[0] as CommentRow), { status: 201 });
}
