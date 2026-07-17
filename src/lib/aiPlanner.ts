import { Temple } from "@/data/temples";
import { getDistanceKm } from "./distance";

export interface DayItinerary {
  day: number;
  date?: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    description: string;
    templeId?: string;
  }[];
  hotelName?: string;
  hotelUrl?: string;
  foodStops?: {
    name: string;
    specialty: string;
  }[];
}

export interface BudgetCostItem {
  category: string; // "Transport" | "Stay" | "Food" | "Darshan" | "Miscellaneous"
  amount: number;
  description: string;
}

export interface YatraPlan {
  id?: string;
  title: string;
  origin: string;
  durationDays: number;
  targetBudget: number;
  actualBudget: number;
  budgetBreakdown: BudgetCostItem[];
  templeIds: string[];
  days: DayItinerary[];
  totalDistanceKm: number;
  totalTravelTime: string;
  mapEmbedUrl: string;
  notes?: string;
}

export interface YatraSearchParams {
  origin: string;
  durationDays: number;
  maxBudget: number;
  category?: string;
  deity?: string;
  theme?: "peaceful" | "mountain" | "family" | "trek" | "general";
  forceTemples?: string[];
  skipSorting?: boolean;
  travelers?: number;
  transportPreference?: string;
  hotelPreference?: string;
  specialNeeds?: string[];
}

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  hyderabad: { lat: 17.3850, lon: 78.4867 },
  delhi: { lat: 28.7041, lon: 77.1025 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  varanasi: { lat: 25.3176, lon: 83.0062 },
  patna: { lat: 25.5941, lon: 85.1376 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  pune: { lat: 18.5204, lon: 73.8567 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
};

// Help helper to match strings loosely
function containsAny(text: string, words: string[]): boolean {
  return words.some(word => text.toLowerCase().includes(word.toLowerCase()));
}

// Parses natural language query into search params
export function parseYatraQuery(query: string, currentPlan?: YatraPlan): YatraSearchParams {
  const queryLower = query.toLowerCase();

  // 1. Duration Days (default to 4, or keep current)
  let durationDays = currentPlan?.durationDays || 4;
  const dayMatch = queryLower.match(/\b(\d+)\s*(?:day|d)\b/);
  if (dayMatch) {
    durationDays = parseInt(dayMatch[1], 10);
  } else {
    // text numbers
    const numMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    for (const [word, val] of Object.entries(numMap)) {
      if (queryLower.includes(`${word} day`)) {
        durationDays = val;
        break;
      }
    }
  }

  // 2. Budget (default to 20000, or keep current)
  let maxBudget = currentPlan?.targetBudget || 20000;
  const budgetMatch = queryLower.match(/(?:under|below|budget|rs\.?|₹|inr)?\s*(\d{4,6})\b/);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1], 10);
    // Ignore small numbers that might be days or other counts
    if (val >= 1000) {
      maxBudget = val;
    }
  } else if (containsAny(queryLower, ["cheap", "budget-friendly", "economy", "low budget"])) {
    maxBudget = 10000;
  } else if (containsAny(queryLower, ["luxury", "premium", "deluxe"])) {
    maxBudget = 60000;
  }

  // 3. Origin City (default to Hyderabad or keep current)
  let origin = currentPlan?.origin || "Hyderabad";
  for (const city of Object.keys(CITY_COORDINATES)) {
    if (queryLower.includes(city)) {
      origin = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }
  const fromMatch = queryLower.match(/(?:from|starting in|start at|out of)\s+([a-zA-Z\s]+)/);
  if (fromMatch && fromMatch[1]) {
    const candidate = fromMatch[1].trim().split(" ")[0];
    if (CITY_COORDINATES[candidate.toLowerCase()]) {
      origin = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  // 4. Category Match
  let category: string | undefined = undefined;
  if (containsAny(queryLower, ["jyotirlinga", "jyothirlinga", "12 jyotirlingas"])) {
    category = "Jyotirlinga";
  } else if (containsAny(queryLower, ["char dham", "chardham"])) {
    category = "Char Dham";
  } else if (containsAny(queryLower, ["shakti peetha", "shaktipeeth", "shakti peeth"])) {
    category = "Shakti Peetha";
  } else if (containsAny(queryLower, ["divya desam", "divyadesam"])) {
    category = "Divya Desam";
  }

  // 5. Deity Match
  let deity: string | undefined = undefined;
  if (containsAny(queryLower, ["shiva", "shiv", "mahadev", "bholenath", "kedarnath", "somnath", "lingaraj", "vishwanath"])) {
    deity = "Shiva";
  } else if (containsAny(queryLower, ["vishnu", "venkateswara", "balaji", "badrinath", "jagannath"])) {
    deity = "Vishnu";
  } else if (containsAny(queryLower, ["krishna", "dwarka", "dwarkadhish"])) {
    deity = "Krishna";
  } else if (containsAny(queryLower, ["durga", "meenakshi", "kamakhya", "devi", "goddess"])) {
    deity = "Durga";
  } else if (containsAny(queryLower, ["ganesha", "ganpati", "siddhivinayak"])) {
    deity = "Ganesha";
  }

  // 6. Theme
  let theme: YatraSearchParams["theme"] = "general";
  if (containsAny(queryLower, ["peaceful", "quiet", "serene", "meditative"])) {
    theme = "peaceful";
  } else if (containsAny(queryLower, ["mountain", "himalaya", "hilly", "trek", "adventure"])) {
    theme = "mountain";
  } else if (containsAny(queryLower, ["family", "elderly", "parents"])) {
    theme = "family";
  }

  // 7. Check if user requests a specific temple directly
  const forceTemples: string[] = [];
  if (queryLower.includes("kedarnath")) forceTemples.push("kedarnath");
  if (queryLower.includes("badrinath")) forceTemples.push("badrinath");
  if (queryLower.includes("kashi") || queryLower.includes("vishwanath")) forceTemples.push("kashi-vishwanath");
  if (queryLower.includes("tirupati") || queryLower.includes("venkateswara")) forceTemples.push("tirumala-venkateswara");
  if (queryLower.includes("meenakshi") || queryLower.includes("madurai")) forceTemples.push("meenakshi-amman");
  if (queryLower.includes("somnath")) forceTemples.push("somnath");
  if (queryLower.includes("puri") || queryLower.includes("jagannath")) forceTemples.push("jagannath-puri");
  if (queryLower.includes("rameshwaram") || queryLower.includes("ramanathaswamy")) forceTemples.push("golden-temple");
  if (queryLower.includes("siddhivinayak")) forceTemples.push("siddhivinayak");
  if (queryLower.includes("kamakhya")) forceTemples.push("kamakhya");
  if (queryLower.includes("dwarka") || queryLower.includes("dwarkadhish")) forceTemples.push("dwarkadhish");
  if (queryLower.includes("lingaraja") || queryLower.includes("bhubaneswar")) forceTemples.push("lingaraja");

  return {
    origin,
    durationDays,
    maxBudget,
    category,
    deity,
    theme,
    forceTemples: forceTemples.length > 0 ? forceTemples : undefined,
  };
}

// Food recommendations database
const FOOD_RECOMMENDATIONS: Record<string, { name: string; specialty: string }[]> = {
  "Tirupati": [
    { name: "Sreeji Saffron Bhaji", specialty: "Crispy South Indian Vada & Podi Idli" },
    { name: "Tirupati Laddu Prasad", specialty: "Sweet sacred laddu rich in ghee and cardamoms" },
    { name: "Bhimas Restaurant", specialty: "Authentic Andhra Meals served on banana leaf" }
  ],
  "Varanasi": [
    { name: "Ram Bhandar", specialty: "Kachori Sabzi & Jalebi breakfast" },
    { name: "Blue Lassi Shop", specialty: "Thick hand-churned fruit lassi in clay cups (kulhad)" },
    { name: "Kashi Chat Bhandar", specialty: "Tamatar Chat and Palak Patta Chat" }
  ],
  "Madurai": [
    { name: "Famous Jigarthanda", specialty: "Jigarthanda - Madurai's famous sweet milk drink" },
    { name: "Murugan Idli Shop", specialty: "Super soft idlis with 4 varieties of chutneys" },
    { name: "Burma Idli", specialty: "Podi Idli and Dosas" }
  ],
  "Kedarnath": [
    { name: "Gaurikund Local Dhabas", specialty: "Hot Ginger Tea, Maggi, and Aloo Parathas" },
    { name: "Kedarnath Temple Area Langar", specialty: "Simple, nourishing Satvik Dal Khichdi" }
  ],
  "Somnath": [
    { name: "Prabhas Patan Gujarati Dining Hall", specialty: "Unlimited Kathiyawadi Thali with Sev Tameta" },
    { name: "Somnath Chowpatty Stalls", specialty: "Garlic Chutney Khichdi and Buttermilk" }
  ],
  "Puri": [
    { name: "Jagannath Temple Anand Bazar", specialty: "Abadha Mahaprasad cooked in earthen pots" },
    { name: "Wildgrass Restaurant", specialty: "Traditional Odia Dalma and Chena Poda dessert" }
  ],
  "Rameswaram": [
    { name: "Hotel Gujarat Bhavan", specialty: "Excellent Gujarati & South Indian Thali" },
    { name: "Temple Road Tea Stall", specialty: "Fresh Filter Coffee & Banana Fritters" }
  ],
  "Mumbai": [
    { name: "Aaswad", specialty: "Piyush & Misal Pav (award-winning)" },
    { name: "Siddhivinayak Area Stalls", specialty: "Fresh hot Vada Pav & Modak sweets" }
  ],
  "Badrinath": [
    { name: "Mana Village Tea Stall", specialty: "Hot tea & local barley roti at India's last village" },
    { name: "Badrinath Market Bhojanalaya", specialty: "Warm North Indian Thali (dal, roti, mixed veg)" }
  ],
  "Guwahati": [
    { name: "Kamakhya Foothills Eatery", specialty: "Assamese Thali with Khar and Pitika" },
    { name: "Nilachal Hills Snacks", specialty: "Steamed Veggie Momo and Cardamom Tea" }
  ],
  "Dwarka": [
    { name: "Govinda Multi Cuisine", specialty: "Krishna Bhog Satvik Gujarati Thali" },
    { name: "Dwarka Chowk Stalls", specialty: "Spicy Khaman Dhokla and Masala Chaas" }
  ],
  "Bhubaneswar": [
    { name: "Odisha Hotel", specialty: "Pakhala Bhata (fermented rice) and mutton curry / Veg Dalma" },
    { name: "Lingaraja Market Dhabas", specialty: "Chhena Gaja and hot Chhena Poda" }
  ]
};

// Hotel recommendations database
const HOTEL_RECOMMENDATIONS: Record<string, { name: string; url: string; baseCost: number }[]> = {
  "Tirupati": [
    { name: "Marasa Sarovar Premiere (Luxury)", url: "https://www.makemytrip.com/hotels/", baseCost: 4500 },
    { name: "Fortune Select Grand Ridge", url: "https://www.booking.com/", baseCost: 3500 },
    { name: "Vaikuntham Guest House (Budget)", url: "https://tirupatibalaji.ap.gov.in/", baseCost: 1000 }
  ],
  "Varanasi": [
    { name: "Taj Ganges Varanasi (Luxury)", url: "https://www.makemytrip.com/hotels/", baseCost: 8500 },
    { name: "BrijRama Palace - Heritage", url: "https://www.booking.com/", baseCost: 9000 },
    { name: "Ganga Darshan Guest House (Budget)", url: "https://www.booking.com/", baseCost: 1200 }
  ],
  "Madurai": [
    { name: "Heritage Madurai (Luxury)", url: "https://www.makemytrip.com/hotels/", baseCost: 5500 },
    { name: "The Gateway Hotel Pasumalai", url: "https://www.booking.com/", baseCost: 4500 },
    { name: "Hotel Temple View (Budget)", url: "https://www.booking.com/", baseCost: 1500 }
  ],
  "Kedarnath": [
    { name: "GMVN Kedarnath Cottages (Budget)", url: "https://badrinath-kedarnath.gov.in/", baseCost: 1500 },
    { name: "Kedarkantha Camp Stays (Budget)", url: "https://www.booking.com/", baseCost: 1200 }
  ],
  "Somnath": [
    { name: "The Fern Residency Somnath", url: "https://www.makemytrip.com/hotels/", baseCost: 3800 },
    { name: "Lords Inn Somnath", url: "https://www.booking.com/", baseCost: 3000 },
    { name: "Somnath Trust Guest House (Budget)", url: "https://somnath.org/", baseCost: 800 }
  ],
  "Puri": [
    { name: "Mayfair Waves Puri (Luxury)", url: "https://www.makemytrip.com/hotels/", baseCost: 7500 },
    { name: "Sterling Puri", url: "https://www.booking.com/", baseCost: 4500 },
    { name: "Jagannath Temple Dharamshala (Budget)", url: "https://jagannath.nic.in/", baseCost: 500 }
  ],
  "Rameswaram": [
    { name: "Daiwik Hotels Rameswaram", url: "https://www.makemytrip.com/hotels/", baseCost: 3200 },
    { name: "Hotel Hyatt Place", url: "https://www.booking.com/", baseCost: 5500 },
    { name: "Rameswaram Temple Yatri Niwas (Budget)", url: "https://rameswaram.tn.gov.in/", baseCost: 800 }
  ],
  "Mumbai": [
    { name: "Taj Mahal Palace (Luxury)", url: "https://www.makemytrip.com/hotels/", baseCost: 18000 },
    { name: "Hotel Bawa Regency", url: "https://www.booking.com/", baseCost: 3500 },
    { name: "Prabhadevi Residency (Budget)", url: "https://www.booking.com/", baseCost: 1800 }
  ],
  "Badrinath": [
    { name: "Sarovar Portico Badrinath", url: "https://www.makemytrip.com/hotels/", baseCost: 6500 },
    { name: "GMVN Badrinath Tourist Bungalow", url: "https://badrinath-kedarnath.gov.in/", baseCost: 1800 }
  ],
  "Guwahati": [
    { name: "Radisson Blu Guwahati", url: "https://www.makemytrip.com/hotels/", baseCost: 6000 },
    { name: "Hotel Kamakhya Inn (Budget)", url: "https://www.booking.com/", baseCost: 1500 }
  ],
  "Dwarka": [
    { name: "Mercure Dwarka", url: "https://www.makemytrip.com/hotels/", baseCost: 4200 },
    { name: "Hawthorn Suites by Wyndham", url: "https://www.booking.com/", baseCost: 5500 },
    { name: "Kokila Dhame Guest House (Budget)", url: "https://dwarkadhish.org/", baseCost: 900 }
  ],
  "Bhubaneswar": [
    { name: "Mayfair Lagoon (Luxury)", url: "https://www.makemytrip.com/hotels/", baseCost: 7500 },
    { name: "Trident Bhubaneswar", url: "https://www.booking.com/", baseCost: 6500 },
    { name: "Lingaraja Dharamshala (Budget)", url: "https://lingarajtemple.com/", baseCost: 600 }
  ]
};

// Generates the optimal Yatra itinerary
export function generateYatraPlan(params: YatraSearchParams, allTemples: Temple[]): YatraPlan {
  const { 
    origin, durationDays, maxBudget, category, deity, theme, forceTemples, skipSorting,
    travelers = 1, transportPreference = "Train", hotelPreference = "Mid-range", specialNeeds = []
  } = params;

  const needsAccessibility = specialNeeds.includes("wheelchair") || specialNeeds.includes("senior") || specialNeeds.includes("pregnant");

  // 1. Filter temples based on search params
  let matchedTemples: Temple[] = [];

  if (forceTemples && forceTemples.length > 0) {
    matchedTemples = forceTemples
      .map(id => allTemples.find(t => t.id === id))
      .filter((t): t is Temple => t !== undefined);
  } else {
    matchedTemples = [...allTemples];
    
    // Accessibility filtering
    if (needsAccessibility) {
      // Exclude Kedarnath (16km steep trek) and any temples requiring hard treks
      matchedTemples = matchedTemples.filter(t => t.id !== "kedarnath");
    }

    // apply criteria
    if (category) {
      matchedTemples = matchedTemples.filter(t => t.category === category);
    }
    if (deity) {
      matchedTemples = matchedTemples.filter(t => t.deity === deity);
    }
    if (theme === "mountain") {
      matchedTemples = matchedTemples.filter(t => t.state === "Uttarakhand" || t.description.toLowerCase().includes("hill") || t.description.toLowerCase().includes("himalaya"));
    } else if (theme === "peaceful") {
      matchedTemples = matchedTemples.filter(t => t.description.toLowerCase().includes("peaceful") || t.description.toLowerCase().includes("nature") || t.state === "Uttarakhand" || t.state === "Assam");
    }
  }

  // If no temples matched, fallback to some default temples
  if (matchedTemples.length === 0) {
    // fallback to a nice cluster of Shiv temples or central temples
    matchedTemples = allTemples.filter(t => t.category === "Jyotirlinga").slice(0, 3);
  }

  // 2. Sort temples relative to the origin coordinate (unless skipSorting is true)
  const originCoord = CITY_COORDINATES[origin.toLowerCase()] || { lat: matchedTemples[0]?.latitude || 20, lon: matchedTemples[0]?.longitude || 78 };
  
  let route: Temple[] = [];
  if (skipSorting) {
    route = [...matchedTemples];
  } else {
    // Greedy nearest-neighbor routing from origin
    const remaining = [...matchedTemples];
    let currentLat = originCoord.lat;
    let currentLon = originCoord.lon;

    while (remaining.length > 0) {
      remaining.sort((a, b) => {
        const distA = getDistanceKm(currentLat, currentLon, a.latitude, a.longitude);
        const distB = getDistanceKm(currentLat, currentLon, b.latitude, b.longitude);
        return distA - distB;
      });
      const next = remaining.shift()!;
      route.push(next);
      currentLat = next.latitude;
      currentLon = next.longitude;
    }
  }

  // 3. Limit number of temples based on days
  // E.g. ~1 temple per 1.5 days for mountain terrains, or 1 temple per day for normal cities
  // If accessibility needed, slow down pace even further
  let basePace = theme === "mountain" ? 1.5 : 1;
  if (needsAccessibility) basePace += 0.5;
  const maxTemples = Math.max(1, Math.min(route.length, Math.floor(durationDays / basePace)));
  const activeRoute = route.slice(0, maxTemples);

  // 4. Calculate distances & travel times
  let totalDistanceKm = 0;
  let currentPos = originCoord;
  let waypointsStr = "";

  activeRoute.forEach((t) => {
    totalDistanceKm += getDistanceKm(currentPos.lat, currentPos.lon, t.latitude, t.longitude);
    currentPos = { lat: t.latitude, lon: t.longitude };
    waypointsStr += `+to:${t.latitude},${t.longitude}`;
  });

  // Calculate return trip distance (optional, let's add 60% for return travel/local transit)
  totalDistanceKm = Math.round(totalDistanceKm * 1.6);
  const avgSpeed = theme === "mountain" ? 25 : 55; // slower in mountains
  const totalTravelHours = totalDistanceKm / avgSpeed;
  const totalTravelTime = totalTravelHours < 24
    ? `${Math.round(totalTravelHours)} hours`
    : `${Math.floor(totalTravelHours / 24)}d ${Math.round(totalTravelHours % 24)}h`;

  // 5. Generate daily itinerary
  const days: DayItinerary[] = [];
  const templesPerDay = Math.ceil(activeRoute.length / durationDays);

  for (let d = 1; d <= durationDays; d++) {
    const dayTemples = activeRoute.slice((d - 1) * templesPerDay, d * templesPerDay);
    const stopoverTemple = dayTemples[dayTemples.length - 1] || activeRoute[activeRoute.length - 1];
    const city = stopoverTemple ? stopoverTemple.city : origin;
    const state = stopoverTemple ? stopoverTemple.state : "";

    // Load custom foods and hotels
    const foods = FOOD_RECOMMENDATIONS[city] || [
      { name: "Local Bhojanalaya", specialty: "Authentic regional thali & sweets" }
    ];
    const hotelList = HOTEL_RECOMMENDATIONS[city] || [
      { name: "Standard Pilgrim Rest House", url: "https://www.booking.com/", baseCost: 1200 }
    ];

    // Filter hotels by budget tier
    let chosenHotel = hotelList[hotelList.length - 1]; // default to budget
    if (maxBudget > 40000 && hotelList.length > 0) {
      chosenHotel = hotelList[0]; // luxury
    } else if (maxBudget > 20000 && hotelList.length > 1) {
      chosenHotel = hotelList[1]; // mid-range
    }

    const dayActivities: DayItinerary["activities"] = [];

    if (d === 1) {
      dayActivities.push({
        time: "06:00 AM",
        activity: `Depart from ${origin}`,
        description: `Start your sacred pilgrimage journey. Travel to ${city} via transit.`
      });
      dayActivities.push({
        time: "02:00 PM",
        activity: "Hotel Check-in & Refreshment",
        description: `Arrive in ${city}, check-in at ${chosenHotel.name}, and relax after the journey.`
      });
    } else {
      dayActivities.push({
        time: "07:00 AM",
        activity: "Morning Prayers & Breakfast",
        description: `Begin the day with peaceful meditation. Enjoy a hearty local breakfast: ${foods[0].specialty} at ${foods[0].name}.`
      });
    }

    // Add temple visits
    dayTemples.forEach((temple, idx) => {
      // Pick an aarti schedule if present, or set general timing
      const aartiTime = temple.aartiSchedule && temple.aartiSchedule.length > 0
        ? temple.aartiSchedule[0].split(" – ")[1] || "08:30 AM"
        : "08:30 AM";

      dayActivities.push({
        time: idx === 0 ? "09:00 AM" : "04:30 PM",
        activity: `Darshan at ${temple.name}`,
        description: `Visit the sacred shrine. ${temple.description.slice(0, 120)}... Dress Code: ${temple.dressCode}.`,
        templeId: temple.id
      });

      if (temple.aartiSchedule && temple.aartiSchedule.length > 0) {
        dayActivities.push({
          time: idx === 0 ? "11:00 AM" : "06:30 PM",
          activity: `Attend Aarti: ${temple.aartiSchedule[0].split(" – ")[0] || "Main Aarti"}`,
          description: `Participate in the divine prayers and hymns at the temple sanctuary.`
        });
      }
    });

    // Add evening routine
    dayActivities.push({
      time: "08:00 PM",
      activity: "Dinner and Local Market Walk",
      description: `Enjoy local specialties for dinner: ${foods[foods.length - 1]?.specialty || "Traditional Thali"} at ${foods[foods.length - 1]?.name || "Local Dhaba"}. Take a leisurely walk around temple streets.`
    });

    dayActivities.push({
      time: "09:30 PM",
      activity: "Rest & Sleep",
      description: `Return to hotel for a peaceful night's sleep to recharge for the next day.`
    });

    days.push({
      day: d,
      title: dayTemples.length > 0
        ? `Sacred trail to ${dayTemples.map(t => t.name).join(" & ")}`
        : `Leisure day & local exploration in ${city}`,
      activities: dayActivities,
      hotelName: chosenHotel.name,
      hotelUrl: chosenHotel.url,
      foodStops: foods.slice(0, 2)
    });
  }

  // Add final return transit on last day
  if (days.length > 0) {
    const lastDay = days[days.length - 1];
    lastDay.activities.push({
      time: "04:00 PM",
      activity: `Return journey to ${origin}`,
      description: `Check-out of hotel and begin return journey. Arrive in ${origin} with blessed memories.`
    });
  }

  // 6. Generate budget items based on duration and budget tier
  let budgetTier = maxBudget < 15000 ? "low" : maxBudget < 35000 ? "medium" : "luxury";
  if (hotelPreference === "Budget") budgetTier = "low";
  if (hotelPreference === "Luxury") budgetTier = "luxury";
  
  // Transport rates
  let baseTransport = budgetTier === "low" ? 1.5 : budgetTier === "medium" ? 3.5 : 8.0;
  if (transportPreference === "Flight") baseTransport = 10.0;
  if (transportPreference === "Private Car") baseTransport = 5.0;
  if (transportPreference === "Train") baseTransport = 3.0;
  if (transportPreference === "Bus") baseTransport = 1.5;

  const transportCost = Math.round(totalDistanceKm * baseTransport) * (transportPreference === "Private Car" ? 1 : travelers);
  const tollCost = transportPreference === "Private Car" ? Math.round(totalDistanceKm * 0.8) : 0; // rough toll estimate

  // Stays rates (assume 2 people per room)
  const hotelRate = budgetTier === "low" ? 1000 : budgetTier === "medium" ? 2500 : 6000;
  const roomsNeeded = Math.ceil(travelers / 2);
  const accommodationCost = hotelRate * roomsNeeded * (durationDays - 1);

  // Food rates
  const foodRate = budgetTier === "low" ? 400 : budgetTier === "medium" ? 800 : 1800;
  const foodCost = foodRate * travelers * durationDays;

  // Darshan/Pooja tickets
  const darshanRate = budgetTier === "low" ? 200 : budgetTier === "medium" ? 1000 : 3000;
  const darshanCost = darshanRate * travelers * activeRoute.length;

  // Misc
  const miscCost = (budgetTier === "low" ? 500 : budgetTier === "medium" ? 2000 : 5000) * travelers;

  const budgetBreakdown: BudgetCostItem[] = [
    {
      category: "Transport",
      amount: transportCost,
      description: `${transportPreference} for ~${totalDistanceKm}km travel (${travelers} travelers)`
    },
    {
      category: "Stay",
      amount: accommodationCost,
      description: `${durationDays - 1} nights in ${hotelPreference} rooms (${roomsNeeded} rooms)`
    },
    {
      category: "Food",
      amount: foodCost,
      description: `Meals for ${travelers} travelers for ${durationDays} days`
    },
    {
      category: "Darshan",
      amount: darshanCost,
      description: `VIP entry tickets, offerings for ${travelers} travelers`
    }
  ];

  if (tollCost > 0) {
    budgetBreakdown.push({
      category: "Tolls & Parking",
      amount: tollCost,
      description: `Estimated highway tolls and temple parking fees`
    });
  }

  budgetBreakdown.push({
    category: "Miscellaneous",
    amount: miscCost,
    description: `Local guide fees, shopping, and emergency reserves`
  });

  const actualBudget = budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);

  // 7. Dynamic Notes
  let notes = `This optimized ${durationDays}-day yatra takes you through ${activeRoute.length} holy shrines starting from ${origin}. `;
  if (actualBudget > maxBudget) {
    notes += `⚠️ Note: The estimated cost (₹${actualBudget.toLocaleString()}) slightly exceeds your target budget of ₹${maxBudget.toLocaleString()}. You can reduce stay costs by choosing dharamshalas or travel by sleeper class trains to save around ₹${Math.round((actualBudget - maxBudget) * 1.2)}!`;
  } else {
    notes += `✨ Budget Check: This plan is well within your budget limit of ₹${maxBudget.toLocaleString()}, saving you approximately ₹${Math.round(maxBudget - actualBudget).toLocaleString()}!`;
  }

  // 8. Generate Map Embed URL
  const originCode = CITY_COORDINATES[origin.toLowerCase()] || { lat: activeRoute[0]?.latitude || 20, lon: activeRoute[0]?.longitude || 78 };
  const destTemple = activeRoute[activeRoute.length - 1];
  const destLat = destTemple ? destTemple.latitude : originCode.lat;
  const destLon = destTemple ? destTemple.longitude : originCode.lon;
  
  // Format waypoints: google.com/maps?saddr=lat,lon&daddr=lat,lon+to:lat,lon&output=embed
  const mapEmbedUrl = `https://maps.google.com/maps?saddr=${originCode.lat},${originCode.lon}&daddr=${destLat},${destLon}${waypointsStr}&t=&z=6&ie=UTF8&iwloc=&output=embed`;

  // 9. Generate title
  const title = `${origin} to ${activeRoute.map(t => t.city).filter((v, i, self) => self.indexOf(v) === i).join("-")} Sacred Yatra`;

  return {
    title,
    origin,
    durationDays,
    targetBudget: maxBudget,
    actualBudget,
    budgetBreakdown,
    templeIds: activeRoute.map(t => t.id),
    days,
    totalDistanceKm: Math.round(totalDistanceKm),
    totalTravelTime,
    mapEmbedUrl,
    notes
  };
}

// Refines the yatra plan based on user comments/natural feedback
export function refineYatraPlan(currentPlan: YatraPlan, refinementQuery: string, allTemples: Temple[]): YatraPlan {
  const queryLower = refinementQuery.toLowerCase();

  // Parse new parameters, seeding with current plan data
  const currentParams = parseYatraQuery(refinementQuery, currentPlan);

  // If user says "remove X", filter out that temple
  let forceTemples = currentPlan.templeIds;
  allTemples.forEach((t) => {
    if (queryLower.includes(`remove ${t.name.toLowerCase()}`) || queryLower.includes(`delete ${t.name.toLowerCase()}`) || queryLower.includes(`remove ${t.city.toLowerCase()}`)) {
      forceTemples = forceTemples.filter(id => id !== t.id);
    }
    if (queryLower.includes(`add ${t.name.toLowerCase()}`) || queryLower.includes(`visit ${t.name.toLowerCase()}`) || queryLower.includes(`add ${t.city.toLowerCase()}`)) {
      if (!forceTemples.includes(t.id)) {
        forceTemples.push(t.id);
      }
    }
  });

  const updatedParams = {
    ...currentParams,
    forceTemples: forceTemples.length > 0 ? forceTemples : undefined
  };

  return generateYatraPlan(updatedParams, allTemples);
}
