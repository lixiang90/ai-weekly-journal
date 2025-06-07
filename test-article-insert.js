const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testArticleInsert() {
  try {
    const now = new Date().toISOString();
    const articleData = {
      id: uuidv4(),
      title: '测试文章',
      author: '测试作者',
      content: '测试内容',
      prompt: '',
      journal_id: 1,
      status: 'approved',
      slug: 'test-article-' + Date.now(),
      created_at: now,
      updated_at: now,
      published_at: now
    };

    console.log('Attempting to insert article:', articleData);

    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select();

    if (error) {
      console.error('Error inserting article:', error);
    } else {
      console.log('Successfully inserted article!');
      console.log('Article data:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testArticleInsert();