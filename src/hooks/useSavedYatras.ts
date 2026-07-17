import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { YatraPlan } from "@/lib/aiPlanner";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = "daivmarg_saved_yatras";

interface ItineraryJson {
  actualBudget?: number;
  budgetBreakdown?: YatraPlan['budgetBreakdown'];
  days?: YatraPlan['days'];
  totalDistanceKm?: number;
  totalTravelTime?: string;
  mapEmbedUrl?: string;
  notes?: string;
}

// Helper to get local yatras
function getLocalYatras(): YatraPlan[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to read from local storage", e);
    return [];
  }
}

// Helper to save local yatras
function saveLocalYatras(yatras: YatraPlan[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(yatras));
  } catch (e) {
    console.error("Failed to write to local storage", e);
  }
}

async function fetchSavedYatras(): Promise<YatraPlan[]> {
  try {
    const { data, error } = await supabase
      .from("saved_yatras")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase query failed, falling back to local storage:", error.message);
      return getLocalYatras();
    }

    return (data || []).map((row) => {
      const itinerary = row.itinerary as unknown as ItineraryJson;
      return {
        id: row.id,
        title: row.title,
        origin: row.origin,
        durationDays: row.duration_days,
        targetBudget: row.budget,
        actualBudget: itinerary?.actualBudget || row.budget,
        budgetBreakdown: itinerary?.budgetBreakdown || [],
        templeIds: row.temples,
        days: itinerary?.days || [],
        totalDistanceKm: itinerary?.totalDistanceKm || 0,
        totalTravelTime: itinerary?.totalTravelTime || "",
        mapEmbedUrl: itinerary?.mapEmbedUrl || "",
        notes: itinerary?.notes || "",
      };
    });
  } catch (err) {
    console.warn("Supabase call threw an exception, falling back to local storage:", err);
    return getLocalYatras();
  }
}

async function saveYatra(plan: YatraPlan): Promise<YatraPlan> {
  const payload = {
    title: plan.title,
    origin: plan.origin,
    duration_days: plan.durationDays,
    budget: plan.targetBudget,
    temples: plan.templeIds,
    itinerary: {
      actualBudget: plan.actualBudget,
      budgetBreakdown: plan.budgetBreakdown,
      days: plan.days,
      totalDistanceKm: plan.totalDistanceKm,
      totalTravelTime: plan.totalTravelTime,
      mapEmbedUrl: plan.mapEmbedUrl,
      notes: plan.notes,
    },
  };

  try {
    const { data, error } = await supabase
      .from("saved_yatras")
      .insert([payload])
      .select();

    if (error) {
      console.warn("Supabase insert failed, saving to local storage instead:", error.message);
      const local = getLocalYatras();
      const newPlan = { ...plan, id: "local_" + Math.random().toString(36).substring(2, 11) };
      local.unshift(newPlan);
      saveLocalYatras(local);
      return newPlan;
    }

    const row = data[0];
    const itinerary = row.itinerary as unknown as ItineraryJson;
    return {
      id: row.id,
      title: row.title,
      origin: row.origin,
      durationDays: row.duration_days,
      targetBudget: row.budget,
      actualBudget: itinerary?.actualBudget || row.budget,
      budgetBreakdown: itinerary?.budgetBreakdown || [],
      templeIds: row.temples,
      days: itinerary?.days || [],
      totalDistanceKm: itinerary?.totalDistanceKm || 0,
      totalTravelTime: itinerary?.totalTravelTime || "",
      mapEmbedUrl: itinerary?.mapEmbedUrl || "",
      notes: itinerary?.notes || "",
    };
  } catch (err) {
    console.warn("Supabase save exception, saving locally:", err);
    const local = getLocalYatras();
    const newPlan = { ...plan, id: "local_" + Math.random().toString(36).substring(2, 11) };
    local.unshift(newPlan);
    saveLocalYatras(local);
    return newPlan;
  }
}

async function updateYatra(plan: YatraPlan): Promise<YatraPlan> {
  if (!plan.id) throw new Error("Plan ID is required to update");

  // Local storage check
  if (plan.id.startsWith("local_")) {
    const local = getLocalYatras();
    const index = local.findIndex(p => p.id === plan.id);
    if (index !== -1) {
      local[index] = plan;
      saveLocalYatras(local);
    }
    return plan;
  }

  const payload = {
    title: plan.title,
    origin: plan.origin,
    duration_days: plan.durationDays,
    budget: plan.targetBudget,
    temples: plan.templeIds,
    itinerary: {
      actualBudget: plan.actualBudget,
      budgetBreakdown: plan.budgetBreakdown,
      days: plan.days,
      totalDistanceKm: plan.totalDistanceKm,
      totalTravelTime: plan.totalTravelTime,
      mapEmbedUrl: plan.mapEmbedUrl,
      notes: plan.notes,
    },
  };

  try {
    const { data, error } = await supabase
      .from("saved_yatras")
      .update(payload)
      .eq("id", plan.id)
      .select();

    if (error) {
      console.warn("Supabase update failed, updating local storage:", error.message);
      const local = getLocalYatras();
      const index = local.findIndex(p => p.id === plan.id);
      if (index !== -1) {
        local[index] = plan;
        saveLocalYatras(local);
      }
      return plan;
    }

    const row = data[0];
    const itinerary = row.itinerary as unknown as ItineraryJson;
    return {
      id: row.id,
      title: row.title,
      origin: row.origin,
      durationDays: row.duration_days,
      targetBudget: row.budget,
      actualBudget: itinerary?.actualBudget || row.budget,
      budgetBreakdown: itinerary?.budgetBreakdown || [],
      templeIds: row.temples,
      days: itinerary?.days || [],
      totalDistanceKm: itinerary?.totalDistanceKm || 0,
      totalTravelTime: itinerary?.totalTravelTime || "",
      mapEmbedUrl: itinerary?.mapEmbedUrl || "",
      notes: itinerary?.notes || "",
    };
  } catch (err) {
    console.warn("Supabase update exception, updating locally:", err);
    const local = getLocalYatras();
    const index = local.findIndex(p => p.id === plan.id);
    if (index !== -1) {
      local[index] = plan;
      saveLocalYatras(local);
    }
    return plan;
  }
}

async function deleteYatra(id: string): Promise<string> {
  // Local storage check
  if (id.startsWith("local_")) {
    const local = getLocalYatras();
    const filtered = local.filter(p => p.id !== id);
    saveLocalYatras(filtered);
    return id;
  }

  try {
    const { error } = await supabase
      .from("saved_yatras")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Supabase delete failed, deleting from local storage:", error.message);
      const local = getLocalYatras();
      const filtered = local.filter(p => p.id !== id);
      saveLocalYatras(filtered);
      return id;
    }
    return id;
  } catch (err) {
    console.warn("Supabase delete exception, deleting locally:", err);
    const local = getLocalYatras();
    const filtered = local.filter(p => p.id !== id);
    saveLocalYatras(filtered);
    return id;
  }
}

export function useSavedYatras() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["saved_yatras"],
    queryFn: fetchSavedYatras,
  });

  const saveMutation = useMutation({
    mutationFn: saveYatra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved_yatras"] });
      toast.success("Yatra itinerary saved successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to save yatra: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateYatra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved_yatras"] });
      toast.success("Yatra itinerary updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update yatra: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteYatra,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved_yatras"] });
      toast.success("Yatra itinerary deleted.");
    },
    onError: (error) => {
      toast.error(`Failed to delete yatra: ${error.message}`);
    }
  });

  return {
    savedYatras: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    saveYatra: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    updateYatra: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteYatra: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
