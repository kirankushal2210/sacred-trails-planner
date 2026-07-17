import fs from 'fs';

async function fetchWikiImage(query) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'SacredTrailsPlanner/1.0 (test@test.com)' } });
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== "-1" && pages[pageId].original) {
      return pages[pageId].original.source;
    }
  } catch (e) {
    console.error("Error fetching for", query, e);
  }
  return null;
}

const temples = [
  { id: "ramanathaswamy", query: "Ramanathaswamy Temple" },
  { id: "vaishno-devi", query: "Vaishno Devi" },
  { id: "kedarnath", query: "Kedarnath Temple" },
  { id: "trimbakeshwar", query: "Trimbakeshwar Shiva Temple" },
  { id: "kailasanatha-ellora", query: "Kailasa temple, Ellora" },
  { id: "kashi-vishwanath", query: "Kashi Vishwanath Temple" },
  { id: "somnath", query: "Somnath temple" },
  { id: "mahakaleshwar", query: "Mahakaleshwar Jyotirlinga" },
  { id: "omkareshwar", query: "Omkareshwar" },
  { id: "brihadeeswara", query: "Brihadisvara Temple, Thanjavur" },
  { id: "srisailam", query: "Mallikarjuna Jyotirlinga" },
  { id: "grishneshwar", query: "Grishneshwar Temple" },
  { id: "vaidyanath", query: "Baidyanath Temple" },
  { id: "nageshwar", query: "Nageshvara Jyotirlinga" },
  { id: "bhimashankar", query: "Bhimashankar Temple" },
  { id: "lingaraja", query: "Lingaraja Temple" },
  { id: "virupaksha-hampi", query: "Virupaksha Temple, Hampi" },
  { id: "badrinath", query: "Badrinath Temple" },
  { id: "jagannath-puri", query: "Jagannath Temple, Puri" },
  { id: "tirumala-venkateswara", query: "Venkateswara Temple, Tirumala" },
  { id: "ranganathaswamy", query: "Ranganathaswamy Temple, Srirangam" },
  { id: "padmanabhaswamy", query: "Padmanabhaswamy Temple" },
  { id: "birla-mandir-hyderabad", query: "Birla Mandir, Hyderabad" },
  { id: "chennakesava-belur", query: "Chennakeshava Temple, Belur" },
  { id: "dwarkadhish", query: "Dwarkadhish Temple" },
  { id: "guruvayur", query: "Guruvayur Temple" },
  { id: "iskcon-vrindavan", query: "Krishna Balaram Mandir" },
  { id: "siddhivinayak", query: "Siddhivinayak Temple, Mumbai" },
  { id: "meenakshi-amman", query: "Meenakshi Temple" },
  { id: "kamakhya", query: "Kamakhya Temple" },
  { id: "tirupati-padmavathi", query: "Padmavathi Temple, Tiruchanur" },
  { id: "konark-sun", query: "Konark Sun Temple" },
  { id: "sabarimala", query: "Sabarimala" },
  { id: "shirdi-sai-baba", query: "Sai Baba of Shirdi" },
  { id: "mahabodhi", query: "Mahabodhi Temple" },
  { id: "akshardham-delhi", query: "Swaminarayan Akshardham (New Delhi)" },
  { id: "golden-temple-amritsar", query: "Golden Temple" }
];

async function run() {
  const result = {};
  for (const t of temples) {
    let img = await fetchWikiImage(t.query);
    if (!img) {
      // fallback generic query
      img = await fetchWikiImage(t.query + " India");
    }
    result[t.id] = { image: img };
    console.log(`Fetched ${t.id}: ${img}`);
    // delay to not overload api
    await new Promise(r => setTimeout(r, 100));
  }
  
  // also get deity images
  const deities = {
    "shiva": "Shiva",
    "vishnu": "Vishnu",
    "krishna": "Krishna",
    "durga": "Durga",
    "ganesha": "Ganesha",
    "buddha": "Gautama Buddha",
    "sikh": "Guru Granth Sahib",
    "swaminarayan": "Swaminarayan"
  };
  
  const deityResult = {};
  for (const [key, query] of Object.entries(deities)) {
    let img = await fetchWikiImage(query);
    deityResult[key] = img;
    console.log(`Fetched deity ${key}: ${img}`);
    await new Promise(r => setTimeout(r, 100));
  }
  
  const finalJson = { temples: result, deities: deityResult };
  fs.writeFileSync('src/data/templeImages.json', JSON.stringify(finalJson, null, 2));
  console.log("Wrote src/data/templeImages.json");
}

run();
