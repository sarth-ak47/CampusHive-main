import { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Star, MapPin, Clock, Wifi, Coffee, BookOpen, Filter } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const vibeFilters = ["All", "Study-friendly", "Budget", "Hangout", "Cafe", "Food"];

const places = [
  { id: 1, name: "Chai Point", type: "Cafe", vibes: ["Budget", "Study-friendly", "Cafe"], rating: 4.3, distance: "200m", hours: "7AM–11PM", description: "Cozy chai spot with WiFi and quiet corners", hasWifi: true },
  { id: 2, name: "Maggi Hub", type: "Eatery", vibes: ["Budget", "Food", "Hangout"], rating: 4.1, distance: "350m", hours: "10AM–12AM", description: "Late-night Maggi and snacks", hasWifi: false },
  { id: 3, name: "The Study Nook", type: "Cafe", vibes: ["Study-friendly", "Cafe"], rating: 4.7, distance: "500m", hours: "8AM–10PM", description: "Best coffee and silence for deep work", hasWifi: true },
  { id: 4, name: "Domino's Pizza", type: "Restaurant", vibes: ["Food", "Hangout"], rating: 3.9, distance: "800m", hours: "11AM–11PM", description: "Pizza deals for groups", hasWifi: true },
  { id: 5, name: "Night Canteen", type: "Eatery", vibes: ["Budget", "Food"], rating: 4.0, distance: "100m", hours: "8PM–2AM", description: "Campus favorite for late-night munchies", hasWifi: false },
  { id: 6, name: "Readers' Cafe", type: "Cafe", vibes: ["Study-friendly", "Cafe", "Hangout"], rating: 4.5, distance: "1.2km", hours: "9AM–9PM", description: "Books + coffee + vibes", hasWifi: true },
  { id: 7, name: "Sports Bar & Grill", type: "Restaurant", vibes: ["Hangout", "Food"], rating: 4.2, distance: "1.5km", hours: "12PM–12AM", description: "Watch matches, grab burgers", hasWifi: true },
  { id: 8, name: "Juice Corner", type: "Eatery", vibes: ["Budget", "Food"], rating: 3.8, distance: "150m", hours: "9AM–8PM", description: "Fresh juices and shakes", hasWifi: false },
];

const typeEmoji: Record<string, string> = { Cafe: "☕", Eatery: "🍜", Restaurant: "🍽️" };

export default function NearbyHub() {
  const [vibe, setVibe] = useState("All");

  const filtered = places.filter((p) => vibe === "All" || p.vibes.includes(vibe));

  return (
    <>
      <PageHeader
        title="Nearby Hub"
        description="Explore spots around campus"
        icon={<Compass className="w-5 h-5 text-primary-foreground" />}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {vibeFilters.map((v) => (
          <Button
            key={v}
            size="sm"
            variant={vibe === v ? "default" : "outline"}
            onClick={() => setVibe(v)}
            className="h-8 text-xs"
          >
            {v}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((place, i) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeEmoji[place.type] || "📍"}</span>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{place.name}</h3>
                      <span className="text-[10px] text-muted-foreground">{place.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-semibold">{place.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">{place.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {place.vibes.map((v) => (
                    <Badge key={v} variant="outline" className="text-[10px] h-5">{v}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {place.distance}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {place.hours}</span>
                  {place.hasWifi && <span className="flex items-center gap-1 text-primary"><Wifi className="w-3 h-3" /> WiFi</span>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}
