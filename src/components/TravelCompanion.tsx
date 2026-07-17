import { useState, useRef, useEffect } from "react";
import { YatraPlan } from "@/lib/aiPlanner";
import { Bot, User, Send, HeartPulse, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TravelCompanionProps {
  plan: YatraPlan;
}

export default function TravelCompanion({ plan }: TravelCompanionProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "bot",
      text: `Namaste! 🙏 I am your live Travel Companion for the ${plan.title}. I have all the details of your ${plan.durationDays}-day journey starting from ${plan.origin}. Ask me anything about the route, emergency contacts, local weather, or travel tips!`,
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateCompanionAnswer = (q: string): string => {
    const lowerQ = q.toLowerCase();
    
    if (lowerQ.includes("emergency") || lowerQ.includes("police") || lowerQ.includes("hospital")) {
      return `Emergency Contacts for your route: National Emergency Number: 112, Police: 100, Ambulance: 108. Stay safe!`;
    }
    
    if (lowerQ.includes("weather") || lowerQ.includes("climate") || lowerQ.includes("rain")) {
      return `Based on your route covering ${plan.templeIds.length} temples, expect varied weather. Carry light cottons for the plains, and a jacket if visiting hilly regions like Uttarakhand or Himachal.`;
    }
    
    if (lowerQ.includes("food") || lowerQ.includes("eat") || lowerQ.includes("restaurant")) {
      const foodStops = plan.days.flatMap(d => d.foodStops?.map(f => f.name) || []);
      return foodStops.length > 0 
        ? `I highly recommend these spots from your itinerary: ${foodStops.slice(0, 3).join(", ")}.` 
        : `You will find great local Sattvic thalis near most temples on your route.`;
    }
    
    if (lowerQ.includes("time") || lowerQ.includes("schedule") || lowerQ.includes("darshan")) {
      return `Your schedule spans ${plan.durationDays} days. Ensure you reach the major shrines early morning (around 5-6 AM) to beat the crowds and catch the Mangala Aarti.`;
    }
    
    if (lowerQ.includes("pack") || lowerQ.includes("carry")) {
      return `Remember to carry comfortable walking shoes, modest clothing for temples, essential medicines, and a reusable water bottle. You can also generate a detailed Packing Checklist from the Planner!`;
    }

    return `I am here to guide you through your ${plan.durationDays}-day yatra. Ask me about weather, food, emergency contacts, or packing tips!`;
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery("");
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: userMsg }]);
    
    setTimeout(() => {
      const answer = generateCompanionAnswer(userMsg);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: answer }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-[350px] border border-border/60 rounded-xl bg-card overflow-hidden">
      <div className="bg-muted/30 p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Live Yatra Companion</span>
        </div>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 text-xs ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
            <div className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center ${m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
              {m.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
            </div>
            <div className={`rounded-xl px-3 py-2 leading-relaxed max-w-[85%] ${m.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/30 border border-border rounded-tl-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your companion..."
            className="flex-1 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button type="submit" size="icon" disabled={!query.trim()} className="rounded-full shrink-0 h-8 w-8">
            <Send className="h-3 w-3" />
          </Button>
        </form>
      </div>
    </div>
  );
}
