import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Phone, ExternalLink, ArrowLeft,
  Shirt, Ticket, Calendar, Info, Star
} from "lucide-react";
import { useTemple } from "@/hooks/useTemples";
import { getDistanceKm, formatDistance, estimateTravelTime } from "@/lib/distance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AITempleAssistant from "@/components/AITempleAssistant";
import TempleCard from "@/components/TempleCard";
import TempleMap from "@/components/TempleMap";
import HotelBooking from "@/components/HotelBooking";
import TempleFacilities from "@/components/TempleFacilities";
import TempleReviews from "@/components/TempleReviews";

const TempleDetail = () => {
  const { id } = useParams();
  const { temple, temples, isLoading } = useTemple(id);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-64 md:h-80 w-full" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!temple) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🛕</p>
          <h2 className="font-display text-xl font-semibold">Temple not found</h2>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/temples">Back to Temples</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nearbyTemples = (temples ?? [])
    .filter((t) => t.id !== temple.id)
    .map((t) => ({
      ...t,
      distance: getDistanceKm(temple.latitude, temple.longitude, t.latitude, t.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  const within100 = nearbyTemples.filter((t) => t.distance <= 100);
  const nearby = within100.length > 0 ? within100 : nearbyTemples.slice(0, 4);

  const fade = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 overflow-hidden bg-muted">
        <img
          src={temple.imageUrl}
          alt={temple.name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <Button variant="ghost" size="sm" className="mb-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link to="/temples">
                <ArrowLeft className="h-4 w-4 mr-1" /> All Temples
              </Link>
            </Button>
            <motion.h1 {...fade} className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              {temple.name}
            </motion.h1>
            <motion.div {...fade} transition={{ delay: 0.1 }} className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/90 text-primary-foreground">{temple.category}</Badge>
              <Badge variant="secondary">{temple.deity}</Badge>
              <span className="flex items-center gap-1 text-sm text-primary-foreground/80">
                <MapPin className="h-3.5 w-3.5" />
                {temple.city}, {temple.state}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.section {...fade}>
              <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> About
              </h2>
              <p className="text-muted-foreground leading-relaxed">{temple.description}</p>
            </motion.section>

            {temple.deityImageUrl && (
              <motion.section {...fade} transition={{ delay: 0.05 }}>
                <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" /> Presiding Deity — {temple.deity}
                </h2>
                <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary via-accent to-primary/50 blur opacity-60" />
                    <img
                      src={temple.deityImageUrl}
                      alt={`Lord ${temple.deity}`}
                      loading="lazy"
                      width={256}
                      height={256}
                      className="relative h-40 w-40 sm:h-48 sm:w-48 rounded-full object-cover border-4 border-background shadow-lg"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-display text-2xl font-semibold">{temple.deity}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      The presiding deity worshipped at {temple.name}.
                    </p>
                    {temple.significance && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {temple.significance}
                      </p>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            <TempleFacilities temple={temple} fade={fade} />

            <motion.section {...fade} transition={{ delay: 0.1 }}>
              <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Aarti Schedule
              </h2>
              <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                {temple.aartiSchedule.map((aarti, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                    <span>{aarti}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section {...fade} transition={{ delay: 0.15 }}>
              <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Location
              </h2>
              <TempleMap latitude={temple.latitude} longitude={temple.longitude} name={temple.name} />
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div {...fade} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Timings</p>
                  <p className="text-sm text-muted-foreground">{temple.timings}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shirt className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Dress Code</p>
                  <p className="text-sm text-muted-foreground">{temple.dressCode}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ticket className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Entry Fee</p>
                  <p className="text-sm text-muted-foreground">{temple.entryFee}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Contact</p>
                  <p className="text-sm text-muted-foreground">{temple.contactInfo}</p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.2 }} className="space-y-2">
              <Button className="w-full" size="lg" asChild>
                <a href={temple.officialDarshanLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Book Darshan
                </a>
              </Button>
              <Button className="w-full" size="lg" variant="outline" asChild>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Opens Google Maps for directions
              </p>
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.25 }}>
              <HotelBooking templeName={temple.name} city={temple.city} state={temple.state} />
            </motion.div>

            <motion.div {...fade} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display font-semibold mb-3">Travel Booking</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <a href="https://www.irctc.co.in/" target="_blank" rel="noopener noreferrer">
                    🚆 Book Train via IRCTC
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm" asChild>
                  <a href="https://www.redbus.in/" target="_blank" rel="noopener noreferrer">
                    🚌 Book Bus via RedBus
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Temple Reviews */}
        <TempleReviews templeId={temple.id} />

        {/* Nearby Temples within 100km */}
        {nearby.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h2 className="font-display text-2xl font-bold mb-2">
              Nearby Temples {within100.length > 0 ? `within 100 km` : ""}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {within100.length > 0
                ? `${within100.length} temple${within100.length !== 1 ? "s" : ""} found within 100 km`
                : "Closest temples to this location"}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {nearby.slice(0, 8).map((t, i) => (
                <TempleCard
                  key={t.id}
                  temple={t}
                  index={i}
                  distance={`${formatDistance(t.distance)} • ${estimateTravelTime(t.distance)}`}
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
      <AITempleAssistant temple={temple} />
    </div>
  );
};

export default TempleDetail;
