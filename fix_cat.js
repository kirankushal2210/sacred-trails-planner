import fs from 'fs';
const data = JSON.parse(fs.readFileSync('src/data/templeImages.json', 'utf8'));

// Find any url that has 1579202673506 or 1514222134 and replace it
// But let's just specifically fix grishneshwar
data.temples['grishneshwar'].image = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Grishneshwar_temple%2C_Verul.jpg";

// Let's also check if any other temple has a cat (the same URL)
const possibleCats = ["1579202673506", "1514222134"];

for (const key in data.temples) {
  for (const catId of possibleCats) {
    if (data.temples[key].image && data.temples[key].image.includes(catId)) {
      console.log(`Replacing potential cat in ${key}`);
      data.temples[key].image = "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80"; // generic safe temple
    }
  }
}

for (const key in data.deities) {
  for (const catId of possibleCats) {
    if (data.deities[key] && data.deities[key].includes(catId)) {
      console.log(`Replacing potential cat in deity ${key}`);
      data.deities[key] = "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=400&q=80"; // generic safe temple
    }
  }
}

fs.writeFileSync('src/data/templeImages.json', JSON.stringify(data, null, 2));
