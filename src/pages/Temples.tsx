import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import TempleCard from "@/components/TempleCard";
import { useTemples } from "@/hooks/useTemples";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { searchTemplesAI, RankedTemple } from "@/lib/templeSearch";

const Temples = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const { data: temples = [], isLoading } = useTemples();

  const [search, setSearch] = useState(initialQuery);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDeity, setSelectedDeity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);

  const states = useMemo(() => [...new Set(temples.map((t) => t.state))].sort(), [temples]);
  const deities = useMemo(() => [...new Set(temples.map((t) => t.deity))].sort(), [temples]);
  const categories = useMemo(() => [...new Set(temples.map((t) => t.category))].sort(), [temples]);

  const hasFilters = selectedState || selectedDeity || selectedCategory;

  const filtered = useMemo(() => {
    let results: RankedTemple[] = [];
    if (search.trim()) {
      results = searchTemplesAI(search, temples);
    } else {
      results = temples.map(t => ({ ...t, score: 0, matchReasons: [] }));
    }

    return results.filter((t) => {
      const matchState = !selectedState || t.state === selectedState;
      const matchDeity = !selectedDeity || t.deity === selectedDeity;
      const matchCategory = !selectedCategory || t.category === selectedCategory;
      return matchState && matchDeity && matchCategory;
    });
  }, [temples, search, selectedState, selectedDeity, selectedCategory]);

  const clearFilters = () => {
    setSelectedState("");
    setSelectedDeity("");
    setSelectedCategory("");
    setSearch("");
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-hero py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Explore <span className="text-gradient-saffron">Sacred Temples</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Describe what you're looking for (e.g. "peaceful Shiva temples in mountains")
            </p>
          </motion.div>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {filtered.length} temple{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-1" /> Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl border border-border bg-card p-4"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">State</label>
                <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">All States</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Deity</label>
                <select value={selectedDeity} onChange={(e) => setSelectedDeity(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">All Deities</option>
                  {deities.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedState && <Badge variant="secondary" className="gap-1">{selectedState}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedState("")} /></Badge>}
            {selectedDeity && <Badge variant="secondary" className="gap-1">{selectedDeity}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDeity("")} /></Badge>}
            {selectedCategory && <Badge variant="secondary" className="gap-1">{selectedCategory}<X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("")} /></Badge>}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((temple, i) => (
              <div key={temple.id} className="relative group">
                {temple.score > 0 && (
                  <div className="absolute -top-3 -right-2 z-10">
                    <Badge className="bg-primary hover:bg-primary border-2 border-background shadow-sm shadow-primary/20">
                      ✨ AI Match
                    </Badge>
                  </div>
                )}
                <TempleCard temple={temple} index={i} />
                {temple.matchReasons && temple.matchReasons.length > 0 && (
                  <div className="absolute top-2 left-2 z-10 max-w-[90%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm shadow-sm text-xs border-primary/20">
                      {temple.matchReasons[0]}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-4xl mb-4">🛕</p>
            <h3 className="font-display text-xl font-semibold">No temples found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear all filters</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Temples;
