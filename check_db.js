import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.from('temples').select('id, name, image_url');
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
check();
