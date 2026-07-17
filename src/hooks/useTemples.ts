import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { temples as localTemples } from "@/data/temples";
import type { Temple } from "@/data/temples";

// Build a lookup of local image URLs by temple id for fallback
const localImageMap = new Map(localTemples.map((t) => [t.id, t.imageUrl]));

async function fetchTemples(): Promise<Temple[]> {
  try {
    const { data, error } = await supabase
      .from("temples")
      .select("*")
      .order("name");

    if (error || !data || data.length === 0) {
      // Fall back to local static data
      return localTemples;
    }

    return (data ?? []).map((row) => {
      // Use local image URL as fallback if DB image is a Wikipedia URL (often blocked)
      const dbImage = row.image_url || "";
      const isWikipedia = dbImage.includes("wikimedia.org") || dbImage.includes("wikipedia.org");
      const localImage = localImageMap.get(row.id) || "";
      const imageUrl = isWikipedia && localImage ? localImage : (dbImage || localImage);

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
        deityImageUrl: (row as { deity_image_url?: string }).deity_image_url ?? '',
      };
    });
  } catch {
    // If Supabase is unreachable, use local data
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

