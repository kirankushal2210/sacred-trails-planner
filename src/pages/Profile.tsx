import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSavedYatras } from "@/hooks/useSavedYatras";
import { UserCircle, Heart, Map, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: savedYatras, isLoading: isYatrasLoading } = useSavedYatras();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 flex items-start sm:items-center gap-6 flex-col sm:flex-row shadow-sm">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
          <UserCircle className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-display font-bold">My Profile</h1>
          <p className="text-muted-foreground">{user.email || user.phone || "Traveler"}</p>
          <div className="pt-2">
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Saved Yatras */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Saved Trips
          </h2>
          {isYatrasLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ) : savedYatras && savedYatras.length > 0 ? (
            <div className="space-y-3">
              {savedYatras.slice(0, 3).map((yatra) => (
                <div key={yatra.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                  <h3 className="font-semibold">{yatra.title}</h3>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Map className="h-3 w-3" /> {yatra.origin}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {yatra.durationDays} Days</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ₹{yatra.actualBudget}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="h-8 text-primary border-primary/20 hover:bg-primary/10" asChild>
                      <Link to={`/profile`}>View Details</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared/${yatra.id}`);
                    }}>
                      Copy Share Link
                    </Button>
                  </div>
                </div>
              ))}
              {savedYatras.length > 3 && (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">View All Saved Trips</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
              You haven't saved any trips yet.
              <Button variant="link" className="mt-2 block w-full" asChild>
                <Link to="/plan">Plan a new Yatra</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Recent Activity / Preferences */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" /> Quick Links
          </h2>
          <div className="grid gap-3">
            <Link to="/plan" className="bg-card border border-border p-4 rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-medium">Plan a New Yatra</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/temples" className="bg-card border border-border p-4 rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors">
              <span className="font-medium">Explore All Temples</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <div className="bg-card border border-border p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground mt-4 py-8">
              <DollarSign className="h-8 w-8 opacity-20" />
              <p>Budget & Preferences are synced with your planner.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
