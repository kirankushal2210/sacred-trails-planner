import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

const validUrls = [
  "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80",
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80",
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=800&q=80"
];

async function fixImages() {
  const { data: temples, error } = await supabase.from('temples').select('*');
  if (error) return console.error(error);

  for (let i = 0; i < temples.length; i++) {
    const temple = temples[i];
    
    // Assign a valid URL round-robin
    const imgUrl = validUrls[i % validUrls.length];
    // Slightly shift the index for deity so it's not identical to the main image
    const deityUrl = validUrls[(i + 3) % validUrls.length].replace("w=800", "w=400");

    console.log(`Updating ${temple.id}...`);
    await supabase.from('temples').update({ 
      image_url: imgUrl,
      deity_image_url: deityUrl
    }).eq('id', temple.id);
  }
  
  console.log("Done updating all temples!");
}

fixImages();
