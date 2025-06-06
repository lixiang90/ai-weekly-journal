import fs from "fs/promises";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { notFound } from "next/navigation";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Article } from '@/types/article';

type Props = {
  params: {
    id: string;
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default async function ArticlePage({
  params,
}: Props) {
  const id = parseInt(params.id);
  const slug = params.slug;

  // 确保 id 是有效的数字
  if (isNaN(id)) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  let article: Article | undefined;

  // 如果是管理员，先从 articles.json 中查找
  if (isAdmin) {
    try {
      const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
      const articlesData = await fs.readFile(articlesPath, 'utf-8');
      const articles = JSON.parse(articlesData);
      article = articles.find((a: Article) => a.id === slug);
    } catch (error) {
      console.error('Error reading articles file:', error);
    }
  }

  // 如果文章未找到或不是管理员，尝试从子刊文件中查找
  if (!article) {
    const filePath = path.join(process.cwd(), "data", `subjournal_${id}.json`);
    try {
      const file = await fs.readFile(filePath, "utf-8");
      const parsedData = JSON.parse(file);
      
      if (parsedData && typeof parsedData === "object" && Array.isArray(parsedData.articles)) {
        article = parsedData.articles.find((a: Article) => a.id === slug);
      }
    } catch (error) {
      console.error("Error reading journal file:", error);
    }
  }

  if (!article) {
    console.error("Article not found:", { id, slug });
    notFound();
  }

  // 如果不是管理员，且文章未通过审核，则返回 404
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
          <p>发布时间：{new Date(article.publishedAt || article.createdAt).toLocaleString()}</p>
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
