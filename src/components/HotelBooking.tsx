import { Hotel, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HotelBookingProps {
  templeName: string;
  city: string;
  state: string;
}

const HotelBooking = ({ templeName, city, state }: HotelBookingProps) => {
  const location = encodeURIComponent(`${city}, ${state}`);
  const searchQuery = encodeURIComponent(`hotels near ${templeName} ${city}`);

  const platforms = [
    {
      name: "MakeMyTrip",
      url: `https://www.makemytrip.com/hotels/hotel-listing/?city=${location}`,
      emoji: "🏨",
    },
    {
      name: "Booking.com",
      url: `https://www.booking.com/searchresults.html?ss=${searchQuery}`,
      emoji: "🌐",
    },
    {
      name: "Goibibo",
      url: `https://www.goibibo.com/hotels/hotels-in-${city.toLowerCase().replace(/\s+/g, '-')}/`,
      emoji: "🏠",
    },
    {
      name: "OYO Rooms",
      url: `https://www.oyorooms.com/search?location=${location}`,
      emoji: "🛏️",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
        <Hotel className="h-5 w-5 text-primary" />
        Hotels & Stays
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Find accommodation near {templeName}
      </p>
      <div className="space-y-2">
        {platforms.map((p) => (
          <Button
            key={p.name}
            variant="outline"
            className="w-full justify-start"
            size="sm"
            asChild
          >
            <a href={p.url} target="_blank" rel="noopener noreferrer">
              <span className="mr-2">{p.emoji}</span>
              {p.name}
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </a>
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">
        Opens external booking platform
      </p>
    </div>
  );
};

export default HotelBooking;
