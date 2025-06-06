import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import path from 'path';
import { Article } from '@/types/article';
import { authOptions } from '@/lib/auth';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

// 读取文章数据
async function readArticles(): Promise<Article[]> {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 写入文章数据
async function writeArticles(articles: Article[]) {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
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

  const { status } = await request.json();
  const articles = await readArticles();

  const articleIndex = articles.findIndex((a: Article) => a.id === id);
  if (articleIndex === -1) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  articles[articleIndex].status = status;
  await writeArticles(articles);

  return NextResponse.json(articles[articleIndex]);
}
