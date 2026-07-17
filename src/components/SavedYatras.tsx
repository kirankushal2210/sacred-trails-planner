import { motion } from "framer-motion";
import { Calendar, MapPin, Trash2, ArrowRight, DollarSign, Loader2 } from "lucide-react";
import { useSavedYatras } from "@/hooks/useSavedYatras";
import { YatraPlan } from "@/lib/aiPlanner";
import { Button } from "@/components/ui/button";

interface SavedYatrasProps {
  onLoadPlan: (plan: YatraPlan) => void;
}

export default function SavedYatras({ onLoadPlan }: SavedYatrasProps) {
  const { savedYatras, isLoading, isError, deleteYatra, isDeleting } = useSavedYatras();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your saved yatras from Database...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 border border-border rounded-xl bg-card">
        <p className="text-4xl mb-3">⚠️</p>
        <h3 className="font-display font-semibold text-lg">Failed to load saved yatras</h3>
        <p className="text-sm text-muted-foreground mt-1">Please try reloading the page.</p>
      </div>
    );
  }

  if (savedYatras.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-muted/10 p-6"
      >
        <p className="text-5xl mb-4">🗺️</p>
        <h3 className="font-display font-semibold text-lg text-gradient-saffron">No Saved Yatras Found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Start planning your holy yatra with the AI Assistant tab and save it to view it here.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold">Your Saved Pilgrimages</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Access and manage all your saved itineraries.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedYatras.map((yatra, index) => (
          <motion.div
            key={yatra.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="border border-border bg-card rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display font-semibold text-sm text-foreground line-clamp-2">
                  {yatra.title}
                </h4>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isDeleting}
                  onClick={() => yatra.id && deleteYatra(yatra.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Starting at {yatra.origin}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{yatra.durationDays} Days Duration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>Total cost: <strong className="text-foreground">₹{yatra.actualBudget.toLocaleString()}</strong></span>
                </div>
              </div>

              {yatra.days && yatra.days.length > 0 && (
                <div className="mt-4 border-t border-border/60 pt-3">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Route overview:</p>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-foreground">
                    <span>{yatra.origin}</span>
                    {yatra.days.map((day, dIdx) => (
                      <span key={dIdx} className="flex items-center gap-1">
                        <ArrowRight className="h-2.5 w-2.5 text-muted-foreground" />
                        <span>Day {day.day} Stop</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onLoadPlan(yatra)}
              className="mt-5 w-full text-xs font-semibold text-primary hover:bg-primary/5 border-primary/20 hover:border-primary/40"
            >
              Load into Planner
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
