import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { temples as localTemples } from "@/data/temples";
import type { Temple } from "@/data/temples";
import templeImages from "@/data/templeImages.json";

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
      // Find the best image from our Wikipedia JSON mapping
      const exactMatch = (templeImages.temples as any)[row.id];
      const imageUrl = exactMatch?.image || row.image_url || "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80";

      // Map deity to deity image
      let deityImageUrl = (row as { deity_image_url?: string }).deity_image_url ?? "";
      if (row.deity) {
        const deityKey = row.deity.toLowerCase();
        if (deityKey.includes("shiva")) deityImageUrl = (templeImages.deities as any).shiva;
        else if (deityKey.includes("vishnu")) deityImageUrl = (templeImages.deities as any).vishnu;
        else if (deityKey.includes("krishna")) deityImageUrl = (templeImages.deities as any).krishna;
        else if (deityKey.includes("durga") || deityKey.includes("parvati") || deityKey.includes("devi")) deityImageUrl = (templeImages.deities as any).durga;
        else if (deityKey.includes("ganesha")) deityImageUrl = (templeImages.deities as any).ganesha;
        else if (deityKey.includes("swaminarayan")) deityImageUrl = (templeImages.deities as any).swaminarayan;
        else if (deityKey.includes("buddha")) deityImageUrl = (templeImages.deities as any).buddha;
        else if (deityKey.includes("sikh") || deityKey.includes("guru")) deityImageUrl = (templeImages.deities as any).sikh;
      }
      if (!deityImageUrl) {
        deityImageUrl = "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400";
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


