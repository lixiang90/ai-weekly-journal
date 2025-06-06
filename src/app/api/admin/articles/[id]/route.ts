import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import path from 'path';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');

// 读取文章数据
async function readArticles() {
  try {
    const data = await fs.readFile(ARTICLES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// 写入文章数据
async function writeArticles(articles: any[]) {
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { status } = await request.json();
  const articles = await readArticles();
  
  const articleIndex = articles.findIndex((a: any) => a.id === params.id);
  if (articleIndex === -1) {
    return new NextResponse('Article not found', { status: 404 });
  }

  articles[articleIndex].status = status;
  await writeArticles(articles);

  return NextResponse.json(articles[articleIndex]);
} 