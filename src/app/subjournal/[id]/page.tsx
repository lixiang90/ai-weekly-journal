import Link from 'next/link';
import { notFound } from "next/navigation";
import { supabase } from '@/lib/supabase';

const subjournals = ["文史哲", "社科", "理科", "数学"];
const POSTS_PER_PAGE = 5;

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

// 关键修改：添加动态路由配置
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SubjournalPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const resolvedSearchParams = await searchParams;
  
  // 确保 id 是有效的数字
  if (isNaN(id)) {
    notFound();
  }

  const journalTitle = subjournals[id] || '未知子刊';

  // 从Supabase获取子刊信息
  const { data: journal, error: journalError } = await supabase
    .from('journals')
    .select('*')
    .eq('id', id)
    .single();

  if (journalError || !journal) {
    console.error('获取子刊信息失败:', journalError);
    notFound();
  }

  // 获取文章总数
  const { count: totalArticles, error: countError } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('journal_id', id)
    .eq('status', 'approved');

  if (countError) {
    console.error('获取文章数量失败:', countError);
    notFound();
  }

  const currentPage = parseInt(resolvedSearchParams.page || '1');
  const totalPages = Math.max(1, Math.ceil((totalArticles || 0) / POSTS_PER_PAGE));

  if (currentPage < 1 || currentPage > totalPages) {
    notFound();
  }

  // 获取分页文章
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('*')
    .eq('journal_id', id)
    .eq('status', 'approved')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE - 1);

  if (articlesError) {
    console.error('获取文章列表失败:', articlesError);
    notFound();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← 返回首页
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">{journalTitle} 子刊</h1>

      {!articles || articles.length === 0 ? (
        <p className="text-gray-500">暂无投稿</p>
      ) : (
        <>
          <div className="space-y-6">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-sm p-6">
                <Link
                  href={`/subjournal/${id}/${article.slug}`}
                  className="block hover:opacity-80"
                >
                  <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
                </Link>
                <div className="text-gray-600 mb-4">
                  <p>作者：{article.author}</p>
                  <p>发布时间：{new Date(article.published_at || article.created_at).toLocaleString()}</p>
                </div>
                {article.prompt && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      查看 Prompt
                    </summary>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{article.prompt}</p>
                    </div>
                  </details>
                )}
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            {currentPage > 1 && (
              <Link
                href={`/subjournal/${id}?page=${currentPage - 1}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                上一页
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/subjournal/${id}?page=${page}`}
                className={`px-4 py-2 rounded ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link
                href={`/subjournal/${id}?page=${currentPage + 1}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                下一页
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}



