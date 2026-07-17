import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

const deityMap = {
  shiva: "https://images.unsplash.com/photo-1621532822501-c8ef6340538a?w=400",
  durga: "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400",
  vishnu: "https://images.unsplash.com/photo-1603766806347-54cfc281a758?w=400",
  krishna: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400",
  ganesha: "https://images.unsplash.com/photo-1567591370504-80c7e520c3a2?w=400",
  buddha: "https://images.unsplash.com/photo-1555627051-9e8c454e1de8?w=400",
  sikh: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=400"
};

async function fixDeityImages() {
  const { data: temples, error } = await supabase.from('temples').select('id, deity_image_url');
  if (error) {
    console.error(error);
    return;
  }

  for (const temple of temples) {
    if (temple.deity_image_url && temple.deity_image_url.includes('/__l5e/')) {
      let newUrl = "";
      if (temple.deity_image_url.includes('shiva')) newUrl = deityMap.shiva;
      else if (temple.deity_image_url.includes('durga') || temple.deity_image_url.includes('parvati')) newUrl = deityMap.durga;
      else if (temple.deity_image_url.includes('vishnu')) newUrl = deityMap.vishnu;
      else if (temple.deity_image_url.includes('krishna')) newUrl = deityMap.krishna;
      else if (temple.deity_image_url.includes('ganesha')) newUrl = deityMap.ganesha;
      else if (temple.deity_image_url.includes('buddha')) newUrl = deityMap.buddha;
      else if (temple.deity_image_url.includes('sikh') || temple.deity_image_url.includes('golden')) newUrl = deityMap.sikh;
      else newUrl = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400"; // fallback

      console.log(`Updating ${temple.id} deity image to ${newUrl}`);
      const { error: updateError } = await supabase
        .from('temples')
        .update({ deity_image_url: newUrl })
        .eq('id', temple.id);

      if (updateError) {
        console.error(`Error updating ${temple.id}:`, updateError);
      }
    }
  }
  
  console.log("Done updating all deity images!");
}

fixDeityImages();
