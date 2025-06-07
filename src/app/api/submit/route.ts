import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function slugify(title: string) {
  return encodeURIComponent(title.trim().replace(/\s+/g, '-').slice(0, 100));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, author, content, prompt, journalId } = body;

  if (!title || !author || !content || journalId === undefined) {
    return NextResponse.json({ error: '缺少字段' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const slug = slugify(title + Date.now()); // 避免重名

  // 准备文章数据
  const articleData = {
    id: crypto.randomUUID(), // 生成唯一ID
    title,
    author,
    content,
    prompt: prompt || '',
    journal_id: journalId,
    status: 'approved', // 默认为已批准
    slug,
    created_at: now,
    updated_at: now,
    published_at: now
  };

  // 插入到Supabase
  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert(articleData)
    .select();

  if (error) {
    console.error('保存文章失败:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
