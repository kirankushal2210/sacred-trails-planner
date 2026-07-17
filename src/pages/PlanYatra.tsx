import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Sparkles, Map, Heart } from "lucide-react";
import { useTemples } from "@/hooks/useTemples";
import { getDistanceKm, formatDistance, estimateTravelTime } from "@/lib/distance";
import TempleCard from "@/components/TempleCard";
import AIYatraPlanner from "@/components/AIYatraPlanner";
import SavedYatras from "@/components/SavedYatras";
import { YatraPlan } from "@/lib/aiPlanner";

const PlanYatra = () => {
  const { data: temples = [], isLoading } = useTemples();
  const [selectedTemple, setSelectedTemple] = useState("");
  const [activeTab, setActiveTab] = useState<"ai" | "manual" | "saved">("ai");
  const [aiPlan, setAiPlan] = useState<YatraPlan | null>(null);

  const selected = temples.find((t) => t.id === selectedTemple);

  const nearbyRoute = useMemo(() => {
    if (!selected) return [];
    return temples
      .filter((t) => t.id !== selected.id)
      .map((t) => ({
        ...t,
        distance: getDistanceKm(selected.latitude, selected.longitude, t.latitude, t.longitude),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [selected, temples]);

  const handleLoadSavedPlan = (plan: YatraPlan) => {
    setAiPlan(plan);
    setActiveTab("ai");
  };

  return (
    <div className="min-h-screen pb-12">
      <section className="bg-gradient-hero py-10">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Plan Your <span className="text-gradient-saffron">Sacred Yatra</span>
            </h1>
            <p className="text-muted-foreground mt-2">Generate a personalized AI itinerary or explore nearby shrines along the route</p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex max-w-md mx-auto mb-8 border border-border p-1 rounded-xl bg-card">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "ai"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "manual"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            Nearby Planner
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "saved"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className="h-3.5 w-3.5" />
            Saved Yatras
          </button>
        </div>

        {/* Tab Body Contents */}
        {activeTab === "ai" && (
          <AIYatraPlanner
            activePlan={aiPlan}
            setActivePlan={setAiPlan}
          />
        )}

        {activeTab === "saved" && (
          <SavedYatras onLoadPlan={handleLoadSavedPlan} />
        )}

        {activeTab === "manual" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-md mx-auto mb-10">
              <label className="text-sm font-medium mb-2 block">Select Main Temple</label>
              <select
                value={selectedTemple}
                onChange={(e) => setSelectedTemple(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={isLoading}
              >
                <option value="">{isLoading ? "Loading temples..." : "Choose a temple..."}</option>
                {temples.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} — {t.city}, {t.state}</option>
                ))}
              </select>
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="rounded-xl border border-border bg-card p-6 mb-8 max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{selected.name}</h3>
                      <p className="text-sm text-muted-foreground">{selected.city}, {selected.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Navigation className="h-4 w-4" />
                    <span>Coordinates: {selected.latitude.toFixed(4)}°N, {selected.longitude.toFixed(4)}°E</span>
                  </div>
                </div>

                {nearbyRoute.length > 0 && (
                  <div>
                    <h2 className="font-display text-xl font-bold mb-2 text-center">Temples Along the Route</h2>
                    <p className="text-center text-sm text-muted-foreground mb-6">Nearby temples sorted by distance from {selected.name}</p>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {nearbyRoute.map((t, i) => (
                        <TempleCard key={t.id} temple={t} index={i} distance={`${formatDistance(t.distance)} • ${estimateTravelTime(t.distance)}`} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!selected && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <p className="text-5xl mb-4">🗺</p>
                <h3 className="font-display text-lg font-semibold">Select a temple to start planning</h3>
                <p className="text-sm text-muted-foreground mt-1">We'll show you nearby temples and route suggestions</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlanYatra;
