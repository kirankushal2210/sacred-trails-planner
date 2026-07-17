import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/templeImages.json', 'utf8'));

const fallbackImages = [
  "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80",
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80",
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=800&q=80"
];

let fbIdx = 0;
for (const key in data.temples) {
  if (!data.temples[key].image) {
    data.temples[key].image = fallbackImages[fbIdx % fallbackImages.length];
    fbIdx++;
  }
}

if (!data.deities.buddha) {
  data.deities.buddha = fallbackImages[0];
}

fs.writeFileSync('src/data/templeImages.json', JSON.stringify(data, null, 2));
