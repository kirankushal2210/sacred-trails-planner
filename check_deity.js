import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

async function check() {
  const { data, error } = await supabase.from('temples').select('id, deity_image_url');
  if (error) console.error(error);
  else console.log(data.filter(t => t.deity_image_url).slice(0, 5));
}
check();
