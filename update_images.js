import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const VITE_SUPABASE_URL = env.match(/VITE_SUPABASE_URL="(.*?)"/)[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*?)"/)[1];

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY);

const unsplashImages = {
  mountain: "https://images.unsplash.com/photo-1626621338346-3ac0e9e064b1?w=800&q=80", // Kedarnath
  shiva: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80", // Kashi
  vishnu: "https://images.unsplash.com/photo-1590766740124-51b4906c3c57?w=800&q=80", // Jagannath
  krishna: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80", // Dwarkadhish
  south: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80", // Meenakshi
  devi: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80", // Kamakhya
  ganesha: "https://images.unsplash.com/photo-1567591370504-80c7e520c3a2?w=800&q=80",
  sun: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80", // Konark
  generic1: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80",
  generic2: "https://images.unsplash.com/photo-1603766806347-54cfc281a758?w=800&q=80",
  generic3: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80",
  generic4: "https://images.unsplash.com/photo-1588181395964-12e33e4cf773?w=800&q=80",
  generic5: "https://images.unsplash.com/photo-1621427642780-7f0ddd6a2aee?w=800&q=80",
  generic6: "https://images.unsplash.com/photo-1590766940554-634f6d3add97?w=800&q=80",
  generic7: "https://images.unsplash.com/photo-1567591370504-81e6e2e0e7e9?w=800&q=80",
};

const generics = [
  unsplashImages.generic1,
  unsplashImages.generic2,
  unsplashImages.generic3,
  unsplashImages.generic4,
  unsplashImages.generic5,
  unsplashImages.generic6,
  unsplashImages.generic7,
];

let genericIdx = 0;
function getGeneric() {
  const url = generics[genericIdx];
  genericIdx = (genericIdx + 1) % generics.length;
  return url;
}

async function fixImages() {
  const { data: temples, error } = await supabase.from('temples').select('*');
  if (error) {
    console.error(error);
    return;
  }

  for (const temple of temples) {
    let newUrl = "";
    
    // Assign based on specific IDs first
    if (temple.id === "kedarnath" || temple.id === "badrinath" || temple.id === "vaishno-devi" || temple.id === "amarnath") {
      newUrl = unsplashImages.mountain;
    } else if (temple.id.includes("kashi") || temple.id.includes("somnath") || temple.id.includes("mahakaleshwar")) {
      newUrl = unsplashImages.shiva;
    } else if (temple.id.includes("meenakshi") || temple.state === "Tamil Nadu" || temple.state === "Kerala") {
      newUrl = unsplashImages.south;
    } else if (temple.id.includes("jagannath") || temple.deity === "Vishnu") {
      newUrl = unsplashImages.vishnu;
    } else if (temple.id.includes("dwarkadhish") || temple.deity === "Krishna") {
      newUrl = unsplashImages.krishna;
    } else if (temple.id.includes("kamakhya") || temple.deity === "Durga" || temple.category === "Shakti Peetha") {
      newUrl = unsplashImages.devi;
    } else if (temple.deity === "Ganesha") {
      newUrl = unsplashImages.ganesha;
    } else if (temple.id.includes("konark") || temple.deity === "Surya") {
      newUrl = unsplashImages.sun;
    } else {
      newUrl = getGeneric(); // Cycle through generic images so they don't look identical
    }

    // Explicit overrides for the main 12
    const exactOverrides = {
      "tirumala-venkateswara": "https://images.unsplash.com/photo-1621427642780-7f0ddd6a2aee?w=800&q=80",
      "kashi-vishwanath": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80",
      "meenakshi-amman": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
      "kedarnath": "https://images.unsplash.com/photo-1626621338346-3ac0e9e064b1?w=800&q=80",
      "somnath": "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80",
      "jagannath-puri": "https://images.unsplash.com/photo-1590766740124-51b4906c3c57?w=800&q=80",
      "ramanathaswamy": "https://images.unsplash.com/photo-1603766806347-54cfc281a758?w=800&q=80",
      "siddhivinayak": "https://images.unsplash.com/photo-1567591370504-80c7e520c3a2?w=800&q=80",
      "badrinath": "https://images.unsplash.com/photo-1588181395964-12e33e4cf773?w=800&q=80",
      "kamakhya": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
      "dwarkadhish": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
      "lingaraja": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80",
    };
    
    if (exactOverrides[temple.id]) {
      newUrl = exactOverrides[temple.id];
    }

    console.log(`Updating ${temple.id} with ${newUrl}`);
    const { error: updateError } = await supabase
      .from('temples')
      .update({ image_url: newUrl })
      .eq('id', temple.id);

    if (updateError) {
      console.error(`Error updating ${temple.id}:`, updateError);
    }
  }
  
  console.log("Done updating all temples!");
}

fixImages();
