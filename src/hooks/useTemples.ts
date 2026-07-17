import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { temples as localTemples } from "@/data/temples";
import type { Temple } from "@/data/temples";

// 8 Verified working Unsplash URLs
const VALID_IMAGES = [
  "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80",
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80",
  "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80",
  "https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=800&q=80"
];

const getDeterministicImage = (id: string, offset: number = 0) => {
  // Simple hash function for string to number
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return VALID_IMAGES[(hash + offset) % VALID_IMAGES.length];
};

const isBrokenUrl = (url: string) => {
  if (!url) return true;
  if (url.includes("wikimedia.org") || url.includes("wikipedia.org")) return true;
  if (url.includes("__l5e")) return true;
  // Known 404 Unsplash URLs from the previous DB state
  if (url.includes("1590766940554-634f6d3add97")) return true;
  if (url.includes("1567591370504-81e6e2e0e7e9")) return true;
  if (url.includes("1603766806347-54cfc281a758")) return true;
  if (url.includes("1567591370504-80c7e520c3a2")) return true;
  if (url.includes("1588181395964-12e33e4cf773")) return true;
  if (url.includes("1626621338346-3ac0e9e064b1")) return true;
  if (url.includes("1590766740124-51b4906c3c57")) return true;
  if (url.includes("1621427642780-7f0ddd6a2aee")) return true;
  return false;
};

async function fetchTemples(): Promise<Temple[]> {
  try {
    const { data, error } = await supabase
      .from("temples")
      .select("*")
      .order("name");

    if (error || !data || data.length === 0) {
      return localTemples;
    }

    return (data ?? []).map((row) => {
      // Fix Main Image
      let imageUrl = row.image_url || "";
      if (isBrokenUrl(imageUrl)) {
        imageUrl = getDeterministicImage(row.id, 0);
      }

      // Fix Deity Image
      let deityImageUrl = (row as { deity_image_url?: string }).deity_image_url ?? "";
      if (isBrokenUrl(deityImageUrl)) {
        // use an offset of 3 so the deity image differs from the main image
        deityImageUrl = getDeterministicImage(row.id, 3).replace("w=800", "w=400");
      }

      return {
        id: row.id,
        name: row.name,
        state: row.state,
        city: row.city,
        deity: row.deity,
        category: row.category,
        latitude: row.latitude,
        longitude: row.longitude,
        description: row.description,
        timings: row.timings,
        aartiSchedule: row.aarti_schedule,
        dressCode: row.dress_code,
        entryFee: row.entry_fee,
        officialDarshanLink: row.official_darshan_link,
        contactInfo: row.contact_info,
        imageUrl,
        facilities: row.facilities ?? [],
        howToReach: row.how_to_reach ?? '',
        bestTimeToVisit: row.best_time_to_visit ?? '',
        significance: row.significance ?? '',
        nearbyAttractions: row.nearby_attractions ?? [],
        deityImageUrl,
      };
    });
  } catch {
    return localTemples;
  }
}

export function useTemples() {
  return useQuery({
    queryKey: ["temples"],
    queryFn: fetchTemples,
  });
}

export function useTemple(id: string | undefined) {
  const { data: temples, ...rest } = useTemples();
  const temple = temples?.find((t) => t.id === id);
  return { temple, temples, ...rest };
}

