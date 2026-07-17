import { useState, useEffect } from "react";
import { YatraPlan } from "@/lib/aiPlanner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, Download, PackageOpen } from "lucide-react";
import { toast } from "sonner";

interface PackingAssistantProps {
  plan: YatraPlan;
}

export default function PackingAssistant({ plan }: PackingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; category: string; name: string; checked: boolean }[]>([]);

  useEffect(() => {
    if (!plan) return;
    
    // Generate intelligent packing list based on the plan
    const isMountain = plan.notes?.toLowerCase().includes("mountain") || plan.templeIds.includes("kedarnath") || plan.templeIds.includes("badrinath");
    const duration = plan.durationDays;
    
    const baseList = [
      { id: "e1", category: "Essentials", name: "Aadhaar Card / ID Proof", checked: false },
      { id: "e2", category: "Essentials", name: "Cash (small denominations)", checked: false },
      { id: "e3", category: "Essentials", name: "Water Bottle", checked: false },
      { id: "e4", category: "Essentials", name: "First Aid Kit & Medicines", checked: false },
      { id: "c1", category: "Clothing", name: "Modest clothes (covers shoulders & knees)", checked: false },
      { id: "c2", category: "Clothing", name: `Undergarments (${duration + 2} pairs)`, checked: false },
      { id: "c3", category: "Clothing", name: "Comfortable walking shoes / slip-ons", checked: false },
      { id: "p1", category: "Pooja Items", name: "Incense sticks / Dhoop", checked: false },
      { id: "p2", category: "Pooja Items", name: "Small matchbox", checked: false },
      { id: "el1", category: "Electronics", name: "Power Bank", checked: false },
      { id: "el2", category: "Electronics", name: "Phone Charger", checked: false },
    ];

    if (isMountain) {
      baseList.push({ id: "m1", category: "Clothing", name: "Heavy Woolens & Thermal Wear", checked: false });
      baseList.push({ id: "m2", category: "Clothing", name: "Windcheater / Raincoat", checked: false });
      baseList.push({ id: "m3", category: "Essentials", name: "Trekking Pole", checked: false });
      baseList.push({ id: "m4", category: "Essentials", name: "Camphor (for breathing at high altitudes)", checked: false });
    } else {
      baseList.push({ id: "nm1", category: "Clothing", name: "Light cotton clothes", checked: false });
      baseList.push({ id: "nm2", category: "Essentials", name: "Sunglasses & Sunscreen", checked: false });
    }

    setItems(baseList);
  }, [plan]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleExport = () => {
    let text = `Packing Checklist for ${plan.title}\n\n`;
    
    const categories = Array.from(new Set(items.map(i => i.category)));
    categories.forEach(cat => {
      text += `--- ${cat} ---\n`;
      items.filter(i => i.category === cat).forEach(item => {
        text += `[${item.checked ? "X" : " "}] ${item.name}\n`;
      });
      text += `\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packing-list-${plan.id || "trip"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Packing list exported successfully!");
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-card">
          <Briefcase className="h-4 w-4 text-primary" />
          Packing Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-xl text-primary flex items-center gap-2">
            <PackageOpen className="h-5 w-5" /> AI Packing Assistant
          </SheetTitle>
          <SheetDescription>
            Personalized checklist for your {plan.durationDays}-day journey to {plan.templeIds.length} temples.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {categories.map(cat => (
            <div key={cat} className="space-y-3">
              <h4 className="text-sm font-bold text-foreground border-b border-border pb-1">{cat}</h4>
              <div className="space-y-2">
                {items.filter(i => i.category === cat).map(item => (
                  <label key={item.id} className={`flex items-center gap-3 text-sm cursor-pointer border p-2.5 rounded-lg transition-colors ${item.checked ? "bg-primary/5 border-primary/30" : "hover:bg-muted/50 border-border"}`}>
                    <div className={`shrink-0 flex items-center justify-center h-5 w-5 rounded-full border ${item.checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                      {item.checked && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <span className={`${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-border mt-6">
            <Button className="w-full gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export as Text File
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
