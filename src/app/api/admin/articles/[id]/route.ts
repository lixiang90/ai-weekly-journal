import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Article } from '@/types/article';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 从 URL 中提取 id
  const url = new URL(request.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1]; // 获取最后一个路径段作为 ID

  const { status } = await request.json();
  
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
