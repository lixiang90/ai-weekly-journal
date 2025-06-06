import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { authOptions } from '@/lib/auth';
import { Article, Journal } from '@/types/article';

const ARTICLES_FILE = path.join(process.cwd(), 'data', 'articles.json');
const JOURNALS_DIR = path.join(process.cwd(), 'data');

// 确保数据目录存在
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

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
  await ensureDataDir();
  await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));
}

// 读取子刊数据
async function readJournal(journalId: number): Promise<Journal> {
  const filePath = path.join(JOURNALS_DIR, `subjournal_${journalId}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { articles: [] };
  }
}

// 写入子刊数据
async function writeJournal(journalId: number, data: Journal) {
  const filePath = path.join(JOURNALS_DIR, `subjournal_${journalId}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// 获取所有文章
export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const articles = await readArticles();
  return NextResponse.json(articles);
}

// 创建新文章
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const data = await request.json();
  const articles = await readArticles();
  
  const newArticle: Article = {
    id: uuidv4(),
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  articles.push(newArticle);
  await writeArticles(articles);

  return NextResponse.json(newArticle);
}

// 更新文章状态
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id, status } = await request.json();
  
  if (!id || !status) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const articles = await readArticles();
  const articleIndex = articles.findIndex((article) => article.id === id);
  
  if (articleIndex === -1) {
    return new NextResponse('Article not found', { status: 404 });
  }

  const article = articles[articleIndex];
  const updatedArticle = {
    ...article,
    status,
    updatedAt: new Date().toISOString(),
  };

  // 如果文章被通过，将其添加到相应的子刊中
  if (status === 'approved') {
    const journal = await readJournal(article.journalId);
    journal.articles.push({
      ...updatedArticle,
      publishedAt: new Date().toISOString(),
    });
    await writeJournal(article.journalId, journal);
  }

  articles[articleIndex] = updatedArticle;
  await writeArticles(articles);
  
  return NextResponse.json(updatedArticle);
} 