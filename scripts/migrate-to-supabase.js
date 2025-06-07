// 数据迁移脚本：将JSON文件数据导入到Supabase数据库
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 环境变量
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase环境变量，请检查.env.local文件');
  process.exit(1);
}

// 创建Supabase客户端（使用service_role密钥以绕过RLS）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 子刊名称
const subjournals = ["文史哲", "社科", "理科", "数学"];

// 主函数
async function migrateData() {
  try {
    console.log('开始数据迁移...');
    
    // 1. 创建子刊数据
    console.log('正在创建子刊数据...');
    for (let i = 0; i < subjournals.length; i++) {
      const { data, error } = await supabase
        .from('journals')
        .upsert({ id: i, name: subjournals[i] })
        .select();
      
      if (error) {
        throw new Error(`创建子刊失败: ${error.message}`);
      }
      console.log(`创建子刊成功: ${subjournals[i]}`);
    }
    
    // 2. 迁移文章数据
    console.log('正在迁移文章数据...');
    
    // 处理每个子刊的文章
    for (let journalId = 0; journalId < subjournals.length; journalId++) {
      const filePath = path.join(process.cwd(), 'data', `subjournal_${journalId}.json`);
      
      try {
        // 读取JSON文件
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        let articles = JSON.parse(fileContent);
        
        // 检查数据格式
        if (!Array.isArray(articles)) {
          if (articles.articles && Array.isArray(articles.articles)) {
            articles = articles.articles;
          } else {
            console.warn(`子刊 ${journalId} 的数据格式不正确，跳过`);
            continue;
          }
        }
        
        console.log(`子刊 ${journalId} (${subjournals[journalId]}) 有 ${articles.length} 篇文章`);
        
        // 批量插入文章
        for (const article of articles) {
          // 准备文章数据
          const articleData = {
            id: article.id || article.slug, // 使用现有ID或slug作为ID
            title: article.title,
            author: article.author,
            content: article.content,
            prompt: article.prompt || '',
            journal_id: journalId,
            status: article.status || 'approved', // 默认为已批准
            slug: article.slug || slugify(article.title + Date.now()),
            created_at: article.createdAt || article.date || new Date().toISOString(),
            updated_at: article.updatedAt || null,
            published_at: article.publishedAt || article.date || new Date().toISOString()
          };
          
          // 插入到Supabase
          const { data, error } = await supabase
            .from('articles')
            .upsert(articleData)
            .select();
          
          if (error) {
            console.error(`文章 "${article.title}" 导入失败:`, error.message);
          } else {
            console.log(`文章 "${article.title}" 导入成功`);
          }
        }
      } catch (err) {
        console.error(`处理子刊 ${journalId} 时出错:`, err.message);
      }
    }
    
    // 3. 处理管理员文章（如果有）
    try {
      const adminArticlesPath = path.join(process.cwd(), 'data', 'articles.json');
      if (fs.existsSync(adminArticlesPath)) {
        const fileContent = fs.readFileSync(adminArticlesPath, 'utf-8');
        let adminArticles = JSON.parse(fileContent);
        
        if (!Array.isArray(adminArticles)) {
          console.warn('管理员文章数据格式不正确，跳过');
        } else {
          console.log(`管理员文章数量: ${adminArticles.length}`);
          
          for (const article of adminArticles) {
            // 准备文章数据
            const articleData = {
              id: article.id,
              title: article.title,
              author: article.author,
              content: article.content,
              prompt: article.prompt || '',
              journal_id: article.journalId,
              status: article.status || 'pending',
              slug: article.slug || slugify(article.title + Date.now()),
              created_at: article.createdAt || new Date().toISOString(),
              updated_at: article.updatedAt || null,
              published_at: article.publishedAt || null
            };
            
            // 插入到Supabase
            const { data, error } = await supabase
              .from('articles')
              .upsert(articleData)
              .select();
            
            if (error) {
              console.error(`管理员文章 "${article.title}" 导入失败:`, error.message);
            } else {
              console.log(`管理员文章 "${article.title}" 导入成功`);
            }
          }
        }
      }
    } catch (err) {
      console.error('处理管理员文章时出错:', err.message);
    }
    
    console.log('数据迁移完成！');
  } catch (error) {
    console.error('迁移过程中出错:', error.message);
    process.exit(1);
  }
}

// 辅助函数：生成slug
function slugify(title) {
  return encodeURIComponent(String(title).trim().replace(/\s+/g, '-').slice(0, 100));
}

// 执行迁移
migrateData();