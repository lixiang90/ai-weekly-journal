const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

// 正确导入 node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdminPost() {
  try {
    // 首先尝试登录获取会话cookie
    console.log('尝试获取会话...');
    
    const articleData = {
      title: '测试文章',
      author: '测试作者',
      content: '测试内容',
      prompt: '',
      journal_id: 1,
      slug: 'test-article-' + Date.now()
    };

    console.log('尝试直接向API发送文章数据:', articleData);

    // 使用supabaseAdmin直接插入数据库，绕过API身份验证
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('缺少Supabase环境变量');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 准备文章数据
    const newArticle = {
      id: require('uuid').v4(),
      title: articleData.title,
      author: articleData.author,
      content: articleData.content,
      prompt: articleData.prompt,
      journal_id: articleData.journal_id,
      slug: articleData.slug,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('使用Supabase服务角色密钥直接插入数据库...');
    const { data, error } = await supabase
      .from('articles')
      .insert(newArticle)
      .select();
      
    if (error) {
      console.error('Supabase插入错误:', error);
    } else {
      console.log('文章成功插入数据库:', data);
    }
  } catch (err) {
    console.error('异常:', err);
  }
}

testAdminPost();