import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, ThumbsUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Review {
  id: string;
  user_email: string;
  text: string;
  likes: number;
  timestamp: string;
}

interface TempleReviewsProps {
  templeId: string;
}

export default function TempleReviews({ templeId }: TempleReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");

  const STORAGE_KEY = `daivmarg_reviews_${templeId}`;

  useEffect(() => {
    // Load from local storage for now (mocking Supabase DB)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      // Seed some mock reviews
      setReviews([
        {
          id: "1",
          user_email: "pilgrim_devotee@example.com",
          text: "Try to visit early morning around 5 AM. The Mangala Aarti is absolutely breathtaking and there's less crowd.",
          likes: 24,
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        }
      ]);
    }
  }, [templeId]);

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to post a tip.");
      return;
    }
    if (!newReview.trim()) return;

    const review: Review = {
      id: Date.now().toString(),
      user_email: user.email || "Anonymous Devotee",
      text: newReview,
      likes: 0,
      timestamp: new Date().toISOString(),
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setNewReview("");
    toast.success("Tip posted successfully!");
  };

  const handleLike = (id: string) => {
    const updated = reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r);
    setReviews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="mt-12 border-t border-border pt-8">
      <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" /> Community Tips & Reviews
      </h2>

      {/* Post a tip */}
      <div className="bg-card border border-border rounded-xl p-4 mb-8 shadow-sm">
        <form onSubmit={handlePostReview} className="flex gap-3 items-start">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <span className="font-bold text-primary text-sm">
              {user ? (user.email?.[0]?.toUpperCase() || "U") : "?"}
            </span>
          </div>
          <div className="flex-1 space-y-2">
            <textarea
              placeholder={user ? "Share a helpful tip with other pilgrims..." : "Sign in to share your experience"}
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              disabled={!user}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary h-20 disabled:opacity-50"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={!user || !newReview.trim()}>
                <Send className="h-4 w-4 mr-2" /> Post Tip
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-muted/30 border border-border rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary text-[10px]">
                    {review.user_email[0].toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-sm">{review.user_email.split('@')[0]}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed mb-3">
              {review.text}
            </p>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-primary" onClick={() => handleLike(review.id)}>
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="text-xs">{review.likes} Helpful</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
