import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";

interface TempleMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

const TempleMap = ({ latitude, longitude, name }: TempleMapProps) => {
  const q = `${latitude},${longitude}`;
  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${name} @${q}`
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;
  const viewUrl = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className="space-y-2">
      <div className="h-64 w-full rounded-xl overflow-hidden border border-border">
        <iframe
          title={`Google Map of ${name}`}
          src={embedSrc}
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" asChild>
          <a href={viewUrl} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </Button>
        <Button size="sm" className="flex-1" asChild>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="h-4 w-4 mr-1" />
            Directions
          </a>
        </Button>
      </div>
    </div>
  );
};

export default TempleMap;
