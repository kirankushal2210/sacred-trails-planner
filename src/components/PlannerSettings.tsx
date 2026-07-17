import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings2, Users, Car, Hotel, Accessibility } from "lucide-react";
import { YatraSearchParams } from "@/lib/aiPlanner";

interface PlannerSettingsProps {
  onApplySettings: (settings: Partial<YatraSearchParams>) => void;
  disabled?: boolean;
}

export default function PlannerSettings({ onApplySettings, disabled }: PlannerSettingsProps) {
  const [open, setOpen] = useState(false);
  
  // Local state for settings
  const [travelers, setTravelers] = useState(1);
  const [transport, setTransport] = useState("Train");
  const [hotelPref, setHotelPref] = useState("Mid-range");
  
  // Special Needs
  const [needs, setNeeds] = useState({
    senior: false,
    wheelchair: false,
    children: false,
    pregnant: false,
  });

  const toggleNeed = (key: keyof typeof needs) => {
    setNeeds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    const specialNeeds = Object.entries(needs)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    onApplySettings({
      travelers,
      transportPreference: transport as any,
      hotelPreference: hotelPref as any,
      specialNeeds: specialNeeds.length > 0 ? specialNeeds : undefined,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={disabled}>
          <Settings2 className="h-4 w-4" />
          Trip Preferences
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-xl text-primary flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Trip Optimizer & Preferences
          </SheetTitle>
          <SheetDescription>
            Adjust your budget and accessibility preferences to customize the AI-generated itinerary.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Travelers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" /> Number of Travelers
            </h4>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setTravelers(Math.max(1, travelers - 1))}>-</Button>
              <span className="w-8 text-center font-bold text-lg">{travelers}</span>
              <Button variant="outline" size="icon" onClick={() => setTravelers(travelers + 1)}>+</Button>
            </div>
          </div>

          {/* Transport Preference */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" /> Transport Preference
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {["Flight", "Train", "Bus", "Private Car"].map(opt => (
                <Button
                  key={opt}
                  variant={transport === opt ? "default" : "outline"}
                  className="w-full justify-start text-xs h-9"
                  onClick={() => setTransport(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          {/* Hotel Preference */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Hotel className="h-4 w-4 text-muted-foreground" /> Hotel Preference
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {["Budget", "Mid-range", "Luxury"].map(opt => (
                <Button
                  key={opt}
                  variant={hotelPref === opt ? "default" : "outline"}
                  className="w-full text-xs h-9 px-1"
                  onClick={() => setHotelPref(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>

          {/* Accessibility & Special Needs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-muted-foreground" /> Special Needs & Accessibility
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select any special needs to automatically filter out difficult terrains and adjust travel pacing.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <input type="checkbox" checked={needs.senior} onChange={() => toggleNeed("senior")} className="rounded text-primary" />
                Senior Citizens
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <input type="checkbox" checked={needs.wheelchair} onChange={() => toggleNeed("wheelchair")} className="rounded text-primary" />
                Wheelchair User
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <input type="checkbox" checked={needs.children} onChange={() => toggleNeed("children")} className="rounded text-primary" />
                Traveling with Kids
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer border p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <input type="checkbox" checked={needs.pregnant} onChange={() => toggleNeed("pregnant")} className="rounded text-primary" />
                Pregnant Women
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border mt-6">
            <Button className="w-full" onClick={handleApply}>
              Apply & Optimize Plan
            </Button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              The AI will recalculate distances, costs, and select suitable temples based on your preferences.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
