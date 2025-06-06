import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { notFound } from "next/navigation";

const subjournals = ["文史哲", "社科", "理科", "数学"];
const POSTS_PER_PAGE = 5;

interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  prompt?: string;
  journalId: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface Journal {
  articles: Article[];
}

// 关键修改：添加动态路由配置
export const dynamic = 'auto';

export default async function SubjournalPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: { page?: string };
}) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  // 确保 id 是有效的数字
  if (isNaN(id)) {
    notFound();
  }

  const journalTitle = subjournals[id] || '未知子刊';

  const filePath = path.join(process.cwd(), 'data', `subjournal_${id}.json`);
  let journal: Journal = { articles: [] };

  try {
    const file = await fs.readFile(filePath, 'utf-8');
    const parsedData = JSON.parse(file);
    
    // 验证数据格式
    if (parsedData && typeof parsedData === 'object' && Array.isArray(parsedData.articles)) {
      journal = parsedData;
    } else {
      console.error('Invalid journal data format:', parsedData);
      notFound();
    }
  } catch (error) {
    console.error('Error reading journal file:', error);
    notFound();
  }

  const currentPage = parseInt(searchParams.page || '1');
  const totalPages = Math.max(1, Math.ceil(journal.articles.length / POSTS_PER_PAGE));

  if (currentPage < 1 || currentPage > totalPages) {
    notFound();
  }

  const paginatedPosts = journal.articles
    .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
    .slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← 返回首页
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-4">{journalTitle} 子刊</h1>

      {journal.articles.length === 0 ? (
        <p className="text-gray-500">暂无投稿</p>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedPosts.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-sm p-6">
                <Link
                  href={`/subjournal/${id}/${article.id}`}
                  className="block hover:opacity-80"
                >
                  <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
                </Link>
                <div className="text-gray-600 mb-4">
                  <p>作者：{article.author}</p>
                  <p>发布时间：{new Date(article.publishedAt || article.createdAt).toLocaleString()}</p>
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



