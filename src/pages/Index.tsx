import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TempleCard from "@/components/TempleCard";
import HeroSection from "@/components/HeroSection";
import { useTemples } from "@/hooks/useTemples";

const Index = () => {
  const { data: temples = [], isLoading } = useTemples();
  const featuredTemples = temples.slice(0, 4);

  return (
    <div className="min-h-screen">
      <HeroSection />

      {/* Featured Temples */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Featured Temples</h2>
            <p className="text-muted-foreground mt-1">Most visited sacred destinations</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/temples" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTemples.map((temple, i) => (
              <TempleCard key={temple.id} temple={temple} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Access */}
      <section className="bg-card border-y border-border">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl font-bold md:text-3xl">Plan Your Journey</h2>
            <p className="text-muted-foreground mt-1">Everything you need for a smooth pilgrimage</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              { icon: "🚆", title: "Book Train", desc: "IRCTC Booking", link: "https://www.irctc.co.in/" },
              { icon: "🚌", title: "Book Bus", desc: "RedBus Booking", link: "https://www.redbus.in/" },
              { icon: "🗺", title: "Plan Yatra", desc: "Route Planner", link: "/plan", internal: true },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                {item.internal ? (
                  <Link
                    to={item.link}
                    className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <h3 className="font-display font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </Link>
                ) : (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <h3 className="font-display font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            * External booking links redirect to official third-party websites.
          </p>
        </div>
      </section>

      {/* Pilgrimage Categories */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-2xl font-bold md:text-3xl">Sacred Categories</h2>
          <p className="text-muted-foreground mt-1">Explore temples by pilgrimage type</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
          {[
            { name: "Jyotirlinga", emoji: "🔱", count: temples.filter(t => t.category === "Jyotirlinga").length },
            { name: "Char Dham", emoji: "🛕", count: temples.filter(t => t.category === "Char Dham").length },
            { name: "Shakti Peetha", emoji: "🪷", count: temples.filter(t => t.category === "Shakti Peetha").length },
            { name: "Divya Desam", emoji: "🙏", count: temples.filter(t => t.category === "Divya Desam").length },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
            >
              <Link
                to={`/temples?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <h3 className="font-display font-semibold">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.count} temples</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
