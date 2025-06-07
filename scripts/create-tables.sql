-- 创建子刊表
CREATE TABLE IF NOT EXISTS journals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT,
  journal_id INTEGER NOT NULL REFERENCES journals(id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(slug, journal_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_articles_journal_id ON articles(journal_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);

-- 初始化子刊数据
INSERT INTO journals (id, name) VALUES 
  (0, '文史哲'),
  (1, '社科'),
  (2, '理科'),
  (3, '数学')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 创建行级安全策略
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 创建公共访问策略（只读）
CREATE POLICY journals_public_read ON journals FOR SELECT USING (true);
CREATE POLICY articles_public_read ON articles FOR SELECT USING (status = 'approved');

-- 创建管理员访问策略（如果需要）
-- 注意：这需要在Supabase中设置适当的角色和权限
-- CREATE POLICY articles_admin_all ON articles FOR ALL USING (auth.role() = 'admin');