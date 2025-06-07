import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

// 创建新文章（用户投稿）
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // 检查用户是否已登录
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    
    // 准备文章数据
    const newArticle = {
      id: uuidv4(),
      title: data.title,
      author: data.author,
      content: data.content,
      prompt: data.prompt || '',
      journal_id: data.journalId,
      slug: `${data.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`.replace(/[^a-z0-9-]/g, ''),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 插入数据库
    const { data: result, error } = await supabaseAdmin
      .from('articles')
      .insert(newArticle)
      .select();

    if (error) {
      console.error('文章提交错误:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error('文章提交异常:', err);
    return NextResponse.json({ error: '提交处理过程中发生错误' }, { status: 500 });
  }
}