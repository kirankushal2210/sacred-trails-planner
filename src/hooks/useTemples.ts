import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Temple } from "@/data/temples";

async function fetchTemples(): Promise<Temple[]> {
  const { data, error } = await supabase
    .from("temples")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => ({
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
    imageUrl: row.image_url,
    facilities: row.facilities ?? [],
    howToReach: row.how_to_reach ?? '',
    bestTimeToVisit: row.best_time_to_visit ?? '',
    significance: row.significance ?? '',
    nearbyAttractions: row.nearby_attractions ?? [],
    deityImageUrl: (row as { deity_image_url?: string }).deity_image_url ?? '',
  }));
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
