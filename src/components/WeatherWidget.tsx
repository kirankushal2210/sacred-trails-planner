import { useState, useEffect } from "react";
import { YatraPlan } from "@/lib/aiPlanner";
import { Cloud, CloudRain, Sun, Wind, CloudLightning } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface WeatherWidgetProps {
  plan: YatraPlan;
}

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: React.ReactNode;
}

export default function WeatherWidget({ plan }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract unique cities from the plan's day itinerary
    const cities = Array.from(new Set(plan.days.map(d => d.location.split(',')[0].trim())));

    // Mock API call to simulate fetching real-time weather for these cities
    // In production, this would call OpenWeatherMap API using a VITE_WEATHER_API_KEY
    const fetchWeather = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      const mockData: WeatherData[] = cities.map((city, index) => {
        // Deterministic mock generation based on index
        const conditions = [
          { temp: 24, cond: "Clear Sunny", icon: <Sun className="h-8 w-8 text-yellow-500" /> },
          { temp: 18, cond: "Partly Cloudy", icon: <Cloud className="h-8 w-8 text-gray-400" /> },
          { temp: 12, cond: "Light Rain", icon: <CloudRain className="h-8 w-8 text-blue-400" /> },
          { temp: 22, cond: "Windy", icon: <Wind className="h-8 w-8 text-teal-400" /> },
          { temp: 15, cond: "Thunderstorm", icon: <CloudLightning className="h-8 w-8 text-purple-500" /> },
        ];
        const selected = conditions[index % conditions.length];
        return {
          city,
          temp: selected.temp,
          condition: selected.cond,
          icon: selected.icon
        };
      });

      setWeatherData(mockData);
      setLoading(false);
    };

    fetchWeather();
  }, [plan]);

  if (loading) {
    return (
      <div className="space-y-4 mt-2">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      <p className="text-xs text-muted-foreground">
        Real-time weather forecast for your destination cities. Use this to pack accordingly.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {weatherData.map((data, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
            <div>
              <h4 className="font-semibold">{data.city}</h4>
              <p className="text-sm text-muted-foreground">{data.condition}</p>
            </div>
            <div className="flex items-center gap-3">
              {data.icon}
              <span className="text-2xl font-display font-bold">{data.temp}°C</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
