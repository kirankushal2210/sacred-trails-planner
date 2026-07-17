import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, Plus, Trash2, Edit2, Save,
  MapPin, Calendar, DollarSign, Utensils, Hotel, ArrowRight,
  Clock, Check, RefreshCw, Info, AlertTriangle, Loader2, Compass
} from "lucide-react";
import { useTemples } from "@/hooks/useTemples";
import { useSavedYatras } from "@/hooks/useSavedYatras";
import {
  parseYatraQuery,
  generateYatraPlan,
  refineYatraPlan,
  YatraPlan,
  DayItinerary,
  BudgetCostItem,
  YatraSearchParams
} from "@/lib/aiPlanner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PlannerSettings from "./PlannerSettings";
import TravelCompanion from "./TravelCompanion";
import PackingAssistant from "./PackingAssistant";
import WeatherWidget from "./WeatherWidget";
import { CloudSun } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  isPlanning?: boolean;
}

const SUGGESTIONS = [
  "I have 4 days from Hyderabad.",
  "Plan a family pilgrimage under ₹15000.",
  "I want to visit Jyotirlingas.",
  "I prefer Shiva temples.",
  "I like peaceful mountain temples."
];

function SortableTempleItem({ id, name }: { id: string, name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-3 bg-card border border-border p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors">
      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">↕</div>
      <span className="font-semibold text-sm">{name}</span>
    </div>
  );
}

interface AIYatraPlannerProps {
  onLoadPlan?: (plan: YatraPlan) => void;
  activePlan: YatraPlan | null;
  setActivePlan: (plan: YatraPlan | null) => void;
}

export default function AIYatraPlanner({ activePlan, setActivePlan }: AIYatraPlannerProps) {
  const { data: temples = [] } = useTemples();
  const { saveYatra, updateYatra, isSaving, isUpdating } = useSavedYatras();

  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Namaste! 🙏 I am your AI Yatra Assistant. Tell me about your dream pilgrimage (e.g., origin city, duration, budget, or preferred deity) and I will plan a detailed sacred itinerary for you."
    }
  ]);
  const [planningStep, setPlanningStep] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "stays" | "budget" | "companion" | "weather">("schedule");
  const [isEditing, setIsEditing] = useState(false);
  const [plannerSettings, setPlannerSettings] = useState<Partial<YatraSearchParams>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // References for scrolling chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPlanning, planningStep]);

  const simulatePlanningSteps = async () => {
    const steps = [
      "Analyzing your request constraints...",
      "Searching the sacred temple database...",
      "Calculating distances and finding optimal route...",
      "Selecting accommodations & regional food spots...",
      "Drafting daily schedule and aarti timings...",
      "Finalizing budget breakdown..."
    ];

    for (const step of steps) {
      setPlanningStep(step);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend
    };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsPlanning(true);

    try {
      // 2. Play planning steps
      await simulatePlanningSteps();

      // 3. Generate or Refine
      let newPlan: YatraPlan;
      if (activePlan) {
        newPlan = refineYatraPlan(activePlan, textToSend, temples);
        // apply settings on top of refined plan
        newPlan = generateYatraPlan({ ...parseYatraQuery(textToSend, activePlan), forceTemples: newPlan.templeIds, skipSorting: true, ...plannerSettings }, temples);
      } else {
        const params = parseYatraQuery(textToSend);
        newPlan = generateYatraPlan({ ...params, ...plannerSettings }, temples);
      }

      // 4. Update plan and send success bot message
      setActivePlan(newPlan);
      setIsEditing(false);

      const botMsg: Message = {
        id: Math.random().toString(),
        sender: "bot",
        text: activePlan
          ? `I have refined your itinerary based on: "${textToSend}". You can see the updated schedule and budget on the dashboard.`
          : `I have crafted a complete yatra itinerary for you! Starting from ${newPlan.origin}, covering ${newPlan.templeIds.length} temples over ${newPlan.durationDays} days.`
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          text: "I encountered an error planning your trip. Please try again with different inputs."
        }
      ]);
    } finally {
      setIsPlanning(false);
      setPlanningStep("");
    }
  };

  const handleSavePlan = () => {
    if (!activePlan) return;
    if (activePlan.id) {
      updateYatra(activePlan);
    } else {
      saveYatra(activePlan, {
        onSuccess: (savedData) => {
          if (savedData) setActivePlan(savedData);
        }
      });
    }
  };

  // Inline Edits
  const updateTitle = (newTitle: string) => {
    if (!activePlan) return;
    setActivePlan({ ...activePlan, title: newTitle });
  };

  const updateNotes = (newNotes: string) => {
    if (!activePlan) return;
    setActivePlan({ ...activePlan, notes: newNotes });
  };

  const updateDayTitle = (dayIndex: number, newTitle: string) => {
    if (!activePlan) return;
    const updatedDays = [...activePlan.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], title: newTitle };
    setActivePlan({ ...activePlan, days: updatedDays });
  };

  const updateActivityField = (dayIndex: number, actIndex: number, field: "time" | "activity" | "description", value: string) => {
    if (!activePlan) return;
    const updatedDays = [...activePlan.days];
    const updatedActivities = [...updatedDays[dayIndex].activities];
    updatedActivities[actIndex] = { ...updatedActivities[actIndex], [field]: value };
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], activities: updatedActivities };
    setActivePlan({ ...activePlan, days: updatedDays });
  };

  const deleteActivity = (dayIndex: number, actIndex: number) => {
    if (!activePlan) return;
    const updatedDays = [...activePlan.days];
    const updatedActivities = updatedDays[dayIndex].activities.filter((_, i) => i !== actIndex);
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], activities: updatedActivities };
    setActivePlan({ ...activePlan, days: updatedDays });
  };

  const addActivity = (dayIndex: number) => {
    if (!activePlan) return;
    const updatedDays = [...activePlan.days];
    updatedDays[dayIndex].activities.push({
      time: "12:00 PM",
      activity: "New Activity",
      description: "Description of your yatra stop..."
    });
    setActivePlan({ ...activePlan, days: updatedDays });
  };

  const updateBudgetAmount = (itemIndex: number, amountStr: string) => {
    if (!activePlan) return;
    const amount = parseInt(amountStr, 10) || 0;
    const updatedBreakdown = [...activePlan.budgetBreakdown];
    updatedBreakdown[itemIndex] = { ...updatedBreakdown[itemIndex], amount };
    const actualBudget = updatedBreakdown.reduce((sum, item) => sum + item.amount, 0);
    setActivePlan({
      ...activePlan,
      budgetBreakdown: updatedBreakdown,
      actualBudget
    });
  };

  const updateHotelName = (dayIndex: number, value: string) => {
    if (!activePlan) return;
    const updatedDays = [...activePlan.days];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], hotelName: value };
    setActivePlan({ ...activePlan, days: updatedDays });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!activePlan || !over || active.id === over.id) return;

    const oldIndex = activePlan.templeIds.indexOf(active.id);
    const newIndex = activePlan.templeIds.indexOf(over.id);
    const newTempleIds = arrayMove(activePlan.templeIds, oldIndex, newIndex);

    // Regenerate plan with exact new order, bypassing greedy sorting
    const params: YatraSearchParams = {
      origin: activePlan.origin,
      durationDays: activePlan.durationDays,
      maxBudget: activePlan.targetBudget,
      forceTemples: newTempleIds,
      skipSorting: true,
    };

    try {
      const newPlan = generateYatraPlan(params, temples);
      // Keep title and custom notes from previous
      newPlan.title = activePlan.title;
      newPlan.notes = activePlan.notes;
      setActivePlan(newPlan);
      toast.success("Route recalculated live!", { description: "Distances, times, and map updated." });
    } catch (e) {
      toast.error("Failed to reorder temples");
    }
  };

  const handleApplySettings = (settings: Partial<YatraSearchParams>) => {
    setPlannerSettings(settings);
    if (!activePlan) {
      toast.success("Preferences saved for your next search!");
      return;
    }
    const params: YatraSearchParams = {
      origin: activePlan.origin,
      durationDays: activePlan.durationDays,
      maxBudget: activePlan.targetBudget,
      forceTemples: activePlan.templeIds,
      skipSorting: true,
      ...settings,
    };
    try {
      const newPlan = generateYatraPlan(params, temples);
      newPlan.title = activePlan.title;
      newPlan.notes = activePlan.notes;
      setActivePlan(newPlan);
      toast.success("Plan optimized!", { description: "Itinerary updated based on your preferences." });
    } catch (e) {
      toast.error("Optimization failed");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      {/* Left Column: Chat Assistant & Quick Actions */}
      <div className="lg:col-span-4 flex flex-col h-[650px] border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="bg-gradient-spiritual p-4 text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 fill-primary-foreground animate-pulse" />
            <div>
              <h3 className="font-display font-semibold leading-none">AI Yatra Guide</h3>
              <p className="text-xs text-primary-foreground/70 mt-1">Ready to plan your pilgrimage</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activePlan && <PackingAssistant plan={activePlan} />}
            <PlannerSettings onApplySettings={handleApplySettings} disabled={isPlanning} />
            {activePlan && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white border-0 rounded-full"
                onClick={() => {
                  setActivePlan(null);
                  setMessages([
                    {
                      id: "welcome",
                      sender: "bot",
                      text: "Namaste! 🙏 Let's plan another yatra. Where would you like to go?"
                    }
                  ]);
                }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat Message Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
              <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-sm ${m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
              </div>
              <div className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${m.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground border border-border"}`}>
                {m.text}
              </div>
            </div>
          ))}

          {/* AI Processing loader */}
          {isPlanning && (
            <div className="flex gap-2 max-w-[85%] mr-auto items-start">
              <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center bg-muted text-foreground animate-spin">
                <Loader2 className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-xl px-3 py-2.5 text-sm bg-muted/30 text-muted-foreground border border-dashed border-border flex flex-col gap-1.5">
                <span className="font-semibold text-xs flex items-center gap-1.5 text-primary">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                  AI Agent at work...
                </span>
                <span className="text-xs italic">{planningStep}</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        {!activePlan && !isPlanning && (
          <div className="p-3 bg-muted/20 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Compass className="h-3 w-3" /> Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="text-xs rounded-full border border-border bg-card px-2.5 py-1 text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Form Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(query);
          }}
          className="p-3 border-t border-border bg-card flex gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activePlan ? "Ask to refine (e.g., 'Make it 5 days', 'Add Badrinath')..." : "Type trip query (e.g., '4 days from Delhi under ₹20k')..."}
            disabled={isPlanning}
            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="icon" disabled={isPlanning || !query.trim()} className="rounded-xl shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Right Column: Itinerary Dashboard View */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {activePlan ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6 relative"
          >
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex-1 min-w-[200px]">
                {isEditing ? (
                  <input
                    type="text"
                    value={activePlan.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    className="w-full font-display text-2xl font-bold bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <h2 className="font-display text-2xl font-bold leading-tight text-gradient-saffron">
                    {activePlan.title}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Starting from {activePlan.origin}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {activePlan.durationDays} Days</span>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-1.5"
                >
                  <Edit2 className="h-4 w-4" />
                  {isEditing ? "Done Editing" : "Edit Plan"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePlan}
                  disabled={isSaving || isUpdating}
                  className="gap-1.5"
                >
                  {isSaving || isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {activePlan.id ? "Update Plan" : "Save Plan"}
                </Button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid gap-3 grid-cols-3 bg-muted/40 rounded-xl p-3 text-center border border-border/50">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Actual Budget</p>
                <p className="text-lg font-bold text-primary">₹{activePlan.actualBudget.toLocaleString()}</p>
              </div>
              <div className="border-x border-border/80">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Travel Distance</p>
                <p className="text-lg font-bold text-foreground">{activePlan.totalDistanceKm} km</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Est. Transit Time</p>
                <p className="text-lg font-bold text-foreground">{activePlan.totalTravelTime}</p>
              </div>
            </div>

            {/* Map & Itinerary Detail Split */}
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-7 flex flex-col gap-4">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  {[
                    { id: "schedule", label: "Schedule", icon: Clock },
                    { id: "stays", label: "Stays & Food", icon: Hotel },
                    { id: "weather", label: "Weather", icon: CloudSun },
                    { id: "budget", label: "Budget Detail", icon: DollarSign },
                    { id: "companion", label: "Companion", icon: HeartPulse }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as "schedule" | "stays" | "budget" | "companion" | "weather")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${activeTab === tab.id ? "border-primary text-primary font-bold" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content panels */}
                <div className="min-h-[300px] overflow-y-auto max-h-[400px] pr-1">
                  {activeTab === "schedule" && (
                    <div className="space-y-4">
                      {isEditing && activePlan.templeIds.length > 0 && (
                        <div className="border border-primary/20 rounded-xl bg-primary/5 p-4 mb-4">
                          <p className="text-xs font-semibold text-primary mb-3 flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> Drag to reorder your route
                          </p>
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={activePlan.templeIds} strategy={verticalListSortingStrategy}>
                              <div className="flex flex-col gap-2">
                                {activePlan.templeIds.map(id => {
                                  const t = temples.find(x => x.id === id);
                                  return t ? <SortableTempleItem key={id} id={id} name={t.name} /> : null;
                                })}
                              </div>
                            </SortableContext>
                          </DndContext>
                          <p className="text-[10px] text-muted-foreground mt-3 italic">
                            Reordering temples will automatically recalculate travel times, fuel estimates, and update the live map below.
                          </p>
                        </div>
                      )}

                      {activePlan.days.map((day, dIdx) => (
                        <div key={day.day} className="border border-border/60 rounded-xl bg-muted/10 p-4 space-y-3">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={day.title}
                                onChange={(e) => updateDayTitle(dIdx, e.target.value)}
                                className="font-semibold text-sm bg-background border border-border rounded px-2 py-0.5 w-full focus:outline-none"
                              />
                            ) : (
                              <h4 className="font-display font-semibold text-sm text-primary">
                                Day {day.day}: {day.title}
                              </h4>
                            )}
                          </div>

                          <div className="space-y-3 border-l-2 border-primary/20 ml-2 pl-4">
                            {day.activities.map((act, aIdx) => (
                              <div key={aIdx} className="relative group text-xs space-y-1">
                                <div className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                                <div className="flex items-start justify-between gap-2">
                                  {isEditing ? (
                                    <div className="flex flex-col gap-1 w-full border border-dashed border-border/80 p-2 rounded bg-background">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={act.time}
                                          onChange={(e) => updateActivityField(dIdx, aIdx, "time", e.target.value)}
                                          className="font-semibold bg-muted px-1.5 py-0.5 rounded border border-border w-20 focus:outline-none"
                                        />
                                        <input
                                          type="text"
                                          value={act.activity}
                                          onChange={(e) => updateActivityField(dIdx, aIdx, "activity", e.target.value)}
                                          className="font-semibold bg-muted px-1.5 py-0.5 rounded border border-border flex-1 focus:outline-none"
                                        />
                                      </div>
                                      <textarea
                                        value={act.description}
                                        onChange={(e) => updateActivityField(dIdx, aIdx, "description", e.target.value)}
                                        rows={2}
                                        className="bg-muted px-1.5 py-0.5 rounded border border-border w-full focus:outline-none"
                                      />
                                      <Button
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => deleteActivity(dIdx, aIdx)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive self-end p-1 h-auto"
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" /> Delete stop
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <div>
                                        <span className="font-semibold text-primary/80 mr-2">{act.time}</span>
                                        <strong className="text-foreground">{act.activity}</strong>
                                        <p className="text-muted-foreground mt-0.5 leading-relaxed">{act.description}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}

                            {isEditing && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => addActivity(dIdx)}
                                className="w-full text-primary hover:bg-primary/5 mt-2"
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Stop/Activity
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "stays" && (
                    <div className="space-y-4">
                      {activePlan.days.map((day) => (
                        <div key={day.day} className="border border-border/60 rounded-xl bg-card p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-1.5 border-b border-border/40 pb-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <h4 className="font-display font-semibold text-xs text-foreground">Night {day.day} Stay & Dining</h4>
                          </div>

                          {day.hotelName && (
                            <div className="flex items-start gap-2.5 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/40">
                              <Hotel className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold">Recommended Hotel:</p>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={day.hotelName}
                                    onChange={(e) => updateHotelName(day.day - 1, e.target.value)}
                                    className="bg-background border border-border rounded px-2 py-0.5 w-full focus:outline-none text-xs mt-1"
                                  />
                                ) : (
                                  <p className="text-muted-foreground">{day.hotelName}</p>
                                )}
                                {day.hotelUrl && (
                                  <a
                                    href={day.hotelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-0.5 mt-1.5"
                                  >
                                    Book hotel online <ArrowRight className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {day.foodStops && day.foodStops.length > 0 && (
                            <div className="flex items-start gap-2.5 text-xs bg-accent/5 p-2.5 rounded-lg border border-border/40">
                              <Utensils className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <div>
                                <p className="font-semibold text-accent-foreground">Suggested Culinary Stops:</p>
                                <div className="space-y-1.5 mt-1">
                                  {day.foodStops.map((f, fIdx) => (
                                    <p key={fIdx} className="text-muted-foreground">
                                      🍛 <strong className="text-foreground">{f.name}</strong> — {f.specialty}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "budget" && (
                    <div className="space-y-3 p-1">
                      {activePlan.budgetBreakdown.map((item, itemIdx) => (
                        <div key={item.category} className="flex items-center justify-between gap-4 border border-border/60 p-3 rounded-lg bg-card">
                          <div className="flex-1">
                            <span className="font-semibold text-xs capitalize text-foreground">{item.category}</span>
                            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{item.description}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 font-bold">
                            <span>₹</span>
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => updateBudgetAmount(itemIdx, e.target.value)}
                                className="w-16 text-right bg-background border border-border rounded px-1.5 py-0.5 text-xs"
                              />
                            ) : (
                              <span>{item.amount.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-border/80 pt-3 flex items-center justify-between font-bold text-sm text-foreground">
                        <span>Total Estimated Budget:</span>
                        <span className="text-primary text-base">₹{activePlan.actualBudget.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "weather" && (
                    <WeatherWidget plan={activePlan} />
                  )}

                  {activeTab === "companion" && (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">Your AI Travel Companion is active for this trip. Ask anything you need during your journey.</p>
                      <TravelCompanion plan={activePlan} />
                    </div>
                  )}
                </div>

                {/* Heuristic Agent Recommendations */}
                {activePlan.notes && (
                  <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 text-xs flex items-start gap-2 text-amber-800">
                    <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      {isEditing ? (
                        <textarea
                          value={activePlan.notes}
                          onChange={(e) => updateNotes(e.target.value)}
                          rows={2}
                          className="w-full text-xs bg-background border border-border rounded p-1.5 focus:outline-none"
                        />
                      ) : (
                        <p className="leading-relaxed">{activePlan.notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive map view */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Dynamic Route Map</p>
                <div className="h-64 md:h-80 w-full rounded-xl overflow-hidden border border-border bg-muted">
                  <iframe
                    title="Yatra route map"
                    src={activePlan.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    loading="lazy"
                    style={{ border: 0 }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="xs" variant="outline" className="flex-1" asChild>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(activePlan.origin)}&destination=${activePlan.days[activePlan.days.length - 1]?.activities[1]?.activity || activePlan.origin}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Google Maps Directions
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty / Suggestion Card */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 text-center h-[500px] bg-muted/10"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-spiritual flex items-center justify-center text-white text-3xl mb-4 shadow-md">
              ॐ
            </div>
            <h3 className="font-display text-xl font-bold text-gradient-saffron">AI Spiritual Itinerary Planner</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Type your itinerary requests or use any suggestion chip in the assistant panel on the left to instantly generate a custom spiritual road map.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> Duration</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><DollarSign className="h-3 w-3" /> Custom Budgeting</span>
              <span>•</span>
              <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> Navigation Route</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
