import { useState, useRef, useEffect } from "react";
import { Temple } from "@/data/temples";
import { Bot, User, Send, MessageSquare, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function AITempleAssistant({ temple }: { temple: Temple }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Namaste! 🙏 I'm your AI guide for ${temple.name}. Ask me about timings, dress code, history, or how to reach!`,
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const generateAnswer = (q: string): string => {
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes("dress") || lowerQ.includes("wear") || lowerQ.includes("clothes")) {
      return `The dress code for ${temple.name} is: ${temple.dressCode}`;
    }
    if (lowerQ.includes("time") || lowerQ.includes("open") || lowerQ.includes("close") || lowerQ.includes("hour")) {
      return `The temple timings are: ${temple.timings}. Aarti schedule: ${temple.aartiSchedule.join(", ")}.`;
    }
    if (lowerQ.includes("history") || lowerQ.includes("about") || lowerQ.includes("significance")) {
      return temple.description;
    }
    if (lowerQ.includes("reach") || lowerQ.includes("travel") || lowerQ.includes("direction")) {
      return `You can easily reach ${temple.name} in ${temple.city}. It's well connected. Open the 'Get Directions' link on the page for exact mapping.`;
    }
    if (lowerQ.includes("fee") || lowerQ.includes("ticket") || lowerQ.includes("cost") || lowerQ.includes("price")) {
      return `Entry Fee details: ${temple.entryFee}. You can check the official link for special darshan booking.`;
    }
    if (lowerQ.includes("contact") || lowerQ.includes("phone") || lowerQ.includes("call")) {
      return `Official Contact: ${temple.contactInfo}`;
    }
    if (lowerQ.includes("food") || lowerQ.includes("eat") || lowerQ.includes("restaurant")) {
      return `There are many local food options in ${temple.city} offering traditional Thalis and Prasadam near the temple premises.`;
    }
    return `I'm a simple AI guide for ${temple.name}. Try asking me about the 'dress code', 'timings', 'entry fee', or 'history'.`;
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery("");
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: userMsg }]);
    
    setTimeout(() => {
      const answer = generateAnswer(userMsg);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: "bot", text: answer }]);
    }, 600);
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-primary hover:bg-primary/90 text-white z-50 p-0"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col h-[500px] max-h-[80vh]">
          {/* Header */}
          <div className="bg-gradient-spiritual p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 fill-white animate-pulse" />
              <div>
                <h3 className="font-semibold text-sm">Temple AI Guide</h3>
                <p className="text-[10px] opacity-80">{temple.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 text-xs ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                <div className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center ${m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.sender === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3 text-primary" />}
                </div>
                <div className={`rounded-xl px-3 py-2 leading-relaxed max-w-[80%] ${m.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm shadow-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-border bg-card">
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
                placeholder="Ask about timings, dress code..."
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="icon" disabled={!query.trim()} className="rounded-full shrink-0 h-8 w-8">
                <Send className="h-3 w-3" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
