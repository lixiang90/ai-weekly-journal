import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Article } from '@/types/article';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 从 URL 中提取 id
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1]; // 获取最后一个路径段作为 ID

  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 从 URL 中提取 id
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1]; // 获取最后一个路径段作为 ID

  const { status, title, author, content, prompt, journalId } = await request.json();
  
  const updateData: any = { 
    updated_at: new Date().toISOString()
  };

  if (status !== undefined) updateData.status = status;
  if (title !== undefined) updateData.title = title;
  if (author !== undefined) updateData.author = author;
  if (content !== undefined) updateData.content = content;
  if (prompt !== undefined) updateData.prompt = prompt;
  if (journalId !== undefined) updateData.journal_id = journalId;

  if (status === 'approved') {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}
