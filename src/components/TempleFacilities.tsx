import { motion } from "framer-motion";
import { Landmark, Navigation, Sun, Sparkles, MapPinned } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Temple } from "@/data/temples";

interface TempleFacilitiesProps {
  temple: Temple;
  fade: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    transition: { duration: number };
  };
}

const TempleFacilities = ({ temple, fade }: TempleFacilitiesProps) => {
  return (
    <>
      {temple.significance && (
        <motion.section {...fade} transition={{ delay: 0.05 }}>
          <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Significance
          </h2>
          <p className="text-muted-foreground leading-relaxed">{temple.significance}</p>
        </motion.section>
      )}

      {temple.facilities.length > 0 && (
        <motion.section {...fade} transition={{ delay: 0.12 }}>
          <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" /> Facilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {temple.facilities.map((f, i) => (
              <Badge key={i} variant="secondary" className="text-sm">
                {f}
              </Badge>
            ))}
          </div>
        </motion.section>
      )}

      {temple.howToReach && (
        <motion.section {...fade} transition={{ delay: 0.18 }}>
          <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" /> How to Reach
          </h2>
          <p className="text-muted-foreground leading-relaxed">{temple.howToReach}</p>
        </motion.section>
      )}

      {temple.bestTimeToVisit && (
        <motion.section {...fade} transition={{ delay: 0.2 }}>
          <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" /> Best Time to Visit
          </h2>
          <p className="text-muted-foreground">{temple.bestTimeToVisit}</p>
        </motion.section>
      )}

      {temple.nearbyAttractions.length > 0 && (
        <motion.section {...fade} transition={{ delay: 0.22 }}>
          <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-primary" /> Nearby Attractions
          </h2>
          <div className="flex flex-wrap gap-2">
            {temple.nearbyAttractions.map((a, i) => (
              <Badge key={i} variant="outline" className="text-sm">
                {a}
              </Badge>
            ))}
          </div>
        </motion.section>
      )}
    </>
  );
};

export default TempleFacilities;
