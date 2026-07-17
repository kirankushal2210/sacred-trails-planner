import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Star } from "lucide-react";
import { Temple } from "@/data/temples";
import { Badge } from "@/components/ui/badge";

interface TempleCardProps {
  temple: Temple;
  index?: number;
  distance?: string;
}

const TempleCard = ({ temple, index = 0, distance }: TempleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link to={`/temple/${temple.id}`}>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
          <div className="relative h-48 overflow-hidden bg-muted">
            <img
              src={temple.imageUrl}
              alt={temple.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs">
              {temple.category}
            </Badge>
            {distance && (
              <Badge variant="secondary" className="absolute top-3 right-3 text-xs">
                {distance}
              </Badge>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-display text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
              {temple.name}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{temple.city}, {temple.state}</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span>{temple.deity}</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="truncate">{temple.timings}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TempleCard;
