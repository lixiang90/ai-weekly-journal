import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '@/lib/auth';
import { Article } from '@/types/article';
import { supabaseAdmin } from '@/lib/supabase';

// 获取所有文章
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(articles);
}

// 创建新文章
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const data = await request.json();
  
  const newArticle = {
    id: uuidv4(),
    ...data,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: result, error } = await supabaseAdmin
    .from('articles')
    .insert(newArticle)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(result[0]);
}

// 更新文章状态
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id, status } = await request.json();
  
  const { data, error } = await supabaseAdmin
    .from('articles')
    .update({ 
      status, 
      updated_at: new Date().toISOString(),
      ...(status === 'approved' ? { published_at: new Date().toISOString() } : {})
    })
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