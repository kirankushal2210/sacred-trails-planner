import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  const bgY = useTransform(scrollY, [0, 600], [0, 200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 600], [1, 1.15]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (val.length > 1) {
      navigate(`/temples?q=${encodeURIComponent(val)}`);
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center justify-center">
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY, scale }}
      >
        <img
          src={heroBg}
          alt="Sacred temples of India"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/10" />
      </motion.div>

      {/* Floating spiritual elements */}
      <div className="absolute inset-0 z-[1] opacity-10 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-[10%] text-8xl"
        >
          🕉
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-24 right-[15%] text-6xl"
        >
          🪷
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-[30%] text-7xl"
        >
          🛕
        </motion.div>
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <span className="text-primary text-base leading-none">ॐ</span>
            DaivMarg — The Divine Path
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl lg:text-7xl drop-shadow-lg">
            Walk the Sacred
            <span className="block text-gradient-saffron">Path of Devotion</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground drop-shadow">
            Discover ancient temples across Bhāratvarsh — explore Jyotirlingas, Char Dhams, Shakti Peethas and more with directions, timings, and pilgrimage planning.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <SearchBar value={search} onChange={handleSearch} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild>
            <Link to="/temples">
              <MapPin className="h-4 w-4 mr-2" />
              Explore Temples
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-card/60 backdrop-blur-sm" asChild>
            <Link to="/plan">
              <Navigation className="h-4 w-4 mr-2" />
              Plan Yatra
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
