import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-spiritual">
                <span className="text-primary-foreground text-xl leading-none font-display">ॐ</span>
              </div>
              <span className="font-display text-lg font-bold text-gradient-saffron">DaivMarg</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Divine Path — your spiritual companion for pilgrimage planning. Discover temples, plan routes, and embark on sacred journeys.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <Link to="/temples" className="hover:text-primary transition-colors">Temples</Link>
              <Link to="/plan" className="hover:text-primary transition-colors">Plan Yatra</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3">Travel</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="https://www.irctc.co.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Book Train (IRCTC)</a>
              <a href="https://www.redbus.in/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Book Bus (RedBus)</a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> DaivMarg is not officially affiliated with any temple authority. External booking links redirect to official third-party websites.
          </p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary fill-primary" /> for devotees everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
