import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

function slugify(title: string) {
  return encodeURIComponent(title.trim().replace(/\s+/g, '-').slice(0, 100));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, author, content, prompt, journalId } = body;

  if (!title || !author || !content || journalId === undefined) {
    return NextResponse.json({ error: '缺少字段' }, { status: 400 });
  }

  const post = {
    title,
    author,
    content,
    prompt: prompt || '',
    slug: slugify(title + Date.now()), // 避免重名
    date: new Date().toISOString(),
  };

  const filePath = path.join(process.cwd(), 'data', `subjournal_${journalId}.json`);
  let existing = [];

  try {
    const file = await fs.readFile(filePath, 'utf-8');
    existing = JSON.parse(file);
  } catch {
    existing = [];
  }

  existing.unshift(post); // 最新文章在前
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2), 'utf-8');

  return NextResponse.json({ success: true });
}
