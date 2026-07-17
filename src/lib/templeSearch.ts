import { Temple } from "@/data/temples";

export interface RankedTemple extends Temple {
  score: number;
  matchReasons: string[];
}

export function searchTemplesAI(query: string, allTemples: Temple[]): RankedTemple[] {
  if (!query || query.trim().length === 0) {
    return allTemples.map(t => ({ ...t, score: 0, matchReasons: [] }));
  }

  const queryLower = query.toLowerCase();
  
  // Extract traits from query
  const wantsPeaceful = ["peaceful", "quiet", "serene", "calm", "meditation"].some(w => queryLower.includes(w));
  const wantsMountain = ["mountain", "hill", "trek", "himalaya", "height"].some(w => queryLower.includes(w));
  const wantsArchitecture = ["architecture", "carving", "sculpture", "ancient", "historical", "history", "pillar"].some(w => queryLower.includes(w));
  const wantsFamily = ["family", "kids", "children", "easy", "accessible"].some(w => queryLower.includes(w));
  const wantsShiva = ["shiva", "mahadev", "shiv", "bholenath"].some(w => queryLower.includes(w));
  const wantsVishnu = ["vishnu", "krishna", "ram", "balaji"].some(w => queryLower.includes(w));
  const wantsGoddess = ["devi", "goddess", "durga", "shakti", "amman"].some(w => queryLower.includes(w));

  const ranked: RankedTemple[] = allTemples.map(temple => {
    let score = 0;
    const reasons: string[] = [];
    const tDesc = temple.description.toLowerCase();
    
    // Direct name/city match is strongest
    if (temple.name.toLowerCase().includes(queryLower) || temple.city.toLowerCase().includes(queryLower)) {
      score += 50;
      reasons.push(`Direct match for ${temple.name}`);
    }

    if (wantsShiva && (temple.deity === "Shiva" || tDesc.includes("shiva"))) {
      score += 20;
      reasons.push("Dedicated to Lord Shiva");
    }
    
    if (wantsVishnu && (temple.deity === "Vishnu" || temple.deity === "Krishna" || tDesc.includes("vishnu"))) {
      score += 20;
      reasons.push(`Dedicated to Lord ${temple.deity}`);
    }
    
    if (wantsGoddess && (temple.deity === "Durga" || temple.category === "Shakti Peetha" || tDesc.includes("goddess"))) {
      score += 20;
      reasons.push("Sacred Goddess Shrine");
    }

    if (wantsMountain && (temple.state === "Uttarakhand" || tDesc.includes("hill") || tDesc.includes("mountain") || tDesc.includes("himalaya"))) {
      score += 15;
      reasons.push("Located in mountainous terrain");
    } else if (wantsMountain) {
      score -= 5; // Penalty if they explicitly want mountains and it's not
    }

    if (wantsPeaceful && (tDesc.includes("peace") || tDesc.includes("serene") || tDesc.includes("calm") || tDesc.includes("meditat"))) {
      score += 15;
      reasons.push("Known for its peaceful atmosphere");
    }

    if (wantsArchitecture && (tDesc.includes("architectur") || tDesc.includes("carving") || tDesc.includes("pillar") || tDesc.includes("century"))) {
      score += 15;
      reasons.push("Renowned architectural heritage");
    }

    if (wantsFamily && temple.id !== "kedarnath" && temple.id !== "badrinath") {
      score += 15;
      reasons.push("Easily accessible for families");
    }

    // Keyword matching for anything else
    const words = queryLower.split(" ").filter(w => w.length > 3);
    for (const word of words) {
      if (tDesc.includes(word) || temple.state.toLowerCase().includes(word) || temple.category.toLowerCase().includes(word)) {
        score += 5;
      }
    }

    return { ...temple, score, matchReasons: reasons };
  });

  // Filter out those with 0 score if query has length
  const filtered = ranked.filter(t => t.score > 0);
  
  // Sort descending by score
  return filtered.sort((a, b) => b.score - a.score);
}
