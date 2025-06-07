const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('journals').select('*');
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Journals data:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testConnection();