import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { YatraPlan } from "@/lib/aiPlanner";
import { supabase } from "@/lib/supabase";
import { Map, Calendar, DollarSign, ArrowLeft, Share2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import TempleMap from "@/components/TempleMap";

export default function SharedTrip() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<YatraPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrip() {
      if (!id) return;
      
      try {
        // Try fetching from supabase
        const { data, error } = await supabase
          .from("saved_yatras")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          throw new Error("Trip not found in database.");
        }

        const itinerary: any = data.itinerary;
        setPlan({
          id: data.id,
          title: data.title,
          origin: data.origin,
          durationDays: data.duration_days,
          targetBudget: data.budget,
          actualBudget: itinerary?.actualBudget || data.budget,
          budgetBreakdown: itinerary?.budgetBreakdown || [],
          templeIds: data.temples,
          days: itinerary?.days || [],
          totalDistanceKm: itinerary?.totalDistanceKm || 0,
          totalTravelTime: itinerary?.totalTravelTime || "",
          mapEmbedUrl: itinerary?.mapEmbedUrl || "",
          notes: itinerary?.notes || "",
        });
      } catch (err) {
        // Fallback to local storage (for testing without backend)
        const local = localStorage.getItem("daivmarg_saved_yatras");
        if (local) {
          const yatras: YatraPlan[] = JSON.parse(local);
          const found = yatras.find(y => y.id === id);
          if (found) {
            setPlan(found);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTrip();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <h1 className="text-3xl font-display font-bold mb-4">Trip Not Found</h1>
        <p className="text-muted-foreground mb-8">This trip link may have expired or is invalid.</p>
        <Button asChild>
          <Link to="/">Plan your own Yatra</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
            <Share2 className="h-4 w-4" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">Shared Itinerary</Badge>
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">{plan.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Map className="h-4 w-4" /> Start: {plan.origin}</span>
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {plan.durationDays} Days</span>
          <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Total Estimate: ₹{plan.actualBudget.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold border-b border-border pb-2">Day-by-Day Schedule</h2>
        
        {plan.days.map((day) => (
          <div key={day.dayNumber} className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-lg text-primary mb-3">Day {day.dayNumber}: {day.location}</h3>
            
            <div className="space-y-4">
              {day.temples.map((temple, i) => (
                <div key={i} className="flex gap-4 items-start relative pl-4 border-l-2 border-primary/20">
                  <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted mr-2">{temple.timeSlot}</span>
                    <span className="font-medium">{temple.name}</span>
                    {temple.activity && <p className="text-sm text-muted-foreground mt-1">{temple.activity}</p>}
                  </div>
                </div>
              ))}
            </div>
            
            {day.foodStops && day.foodStops.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-2">Recommended Stops:</p>
                <div className="flex flex-wrap gap-2">
                  {day.foodStops.map((food, i) => (
                    <span key={i} className="text-xs bg-muted/50 px-2 py-1 rounded-md border border-border">
                      {food.name} ({food.type})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center bg-muted/30 p-8 rounded-2xl border border-border">
        <h3 className="font-display font-bold mb-2">Create your own divine journey</h3>
        <p className="text-muted-foreground text-sm mb-4">Use our AI to plan the perfect sacred trail tailored to your budget and needs.</p>
        <Button asChild>
          <Link to="/plan">Start Planning</Link>
        </Button>
      </div>
    </div>
  );
}
