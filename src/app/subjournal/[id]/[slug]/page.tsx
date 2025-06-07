import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// 关键修改：使用动态路由类型声明
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  prompt?: string;
  journal_id: number;
  status: 'pending' | 'approved' | 'rejected';
  slug: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
}

export default async function ArticlePage({ params }: {
  params: Promise<{ id: string; slug: string }>
}) {
  // 解析 Promise 获取参数
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const slug = resolvedParams.slug;

  if (isNaN(id)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  let article: Article | null = null;

  if (isAdmin) {
    // 管理员可以查看所有文章，包括未批准的
    // 首先尝试通过 id 查询（用于管理后台链接）
    let { data, error } = await supabaseAdmin
      .from('articles')
      .select('*')
      .eq('id', slug)
      .single();

    if (error) {
      // 如果通过 id 查询失败，尝试通过 slug 查询
      const result = await supabaseAdmin
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('获取文章失败:', error);
    } else {
      article = data;
    }
  }

  if (!article) {
    // 非管理员或管理员查询失败，只查询已批准的文章
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('journal_id', id)
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (error) {
      console.error('获取文章失败:', error);
      notFound();
    }

    article = data;
  }

  if (!article) {
    console.error("文章未找到:", { id, slug });
    notFound();
  }

  if (!isAdmin && article.status !== 'approved') {
    notFound();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link
          href={isAdmin ? '/admin' : `/subjournal/${id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← 返回{isAdmin ? '管理后台' : '子刊列表'}
        </Link>
        {isAdmin && article.status !== 'approved' && (
          <div className="text-sm text-gray-600">
            状态: {article.status === 'pending' ? '待审核' : '已拒绝'}
          </div>
        )}
      </div>

      <article className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        <div className="text-gray-600 mb-6">
          <p>作者：{article.author}</p>
          <p>发布时间：{new Date(article.published_at || article.created_at).toLocaleString()}</p>
        </div>

        {article.prompt && (
          <details className="mb-6">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
              查看使用的 Prompt
            </summary>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{article.prompt}</p>
            </div>
          </details>
        )}

        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}


