import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Clock, Info, Building2, Eye } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Hotspot {
  id: string;
  name: string;
  type: string;
  description: string;
  timings: string;
  x: number;
  y: number;
  color: string;
}

const hotspots: Hotspot[] = [
  { id: "academic", name: "Academic Block", type: "academic", description: "Main lecture halls, labs, and faculty offices for CS, ECE, and ME departments.", timings: "8 AM – 6 PM", x: 25, y: 30, color: "hsl(var(--primary))" },
  { id: "library", name: "Central Library", type: "facility", description: "3-floor library with reading rooms, digital lab, and group study chambers.", timings: "7 AM – 12 AM", x: 55, y: 20, color: "hsl(var(--info))" },
  { id: "hostel", name: "Hostel Complex", type: "residential", description: "Boys & Girls hostels with single/double/triple rooms, common rooms, and Wi-Fi.", timings: "24/7", x: 80, y: 45, color: "hsl(var(--success))" },
  { id: "mess", name: "Central Mess", type: "dining", description: "Main dining hall serving breakfast, lunch, and dinner. Veg & non-veg options.", timings: "7:30 AM – 9:30 PM", x: 60, y: 55, color: "hsl(var(--warning))" },
  { id: "sports", name: "Sports Complex", type: "sports", description: "Cricket ground, basketball court, gym, swimming pool, and indoor games.", timings: "6 AM – 9 PM", x: 35, y: 70, color: "hsl(var(--accent))" },
  { id: "admin", name: "Admin Building", type: "admin", description: "Dean's office, registrar, finance, and student affairs.", timings: "9 AM – 5 PM", x: 15, y: 55, color: "hsl(var(--destructive))" },
  { id: "hospital", name: "Health Center", type: "medical", description: "Campus clinic with general physician, first aid, and ambulance service.", timings: "24/7 Emergency", x: 70, y: 75, color: "hsl(var(--destructive))" },
  { id: "canteen", name: "Night Canteen", type: "dining", description: "Late-night snacks, chai, and Maggi for hostel residents.", timings: "9 PM – 2 AM", x: 75, y: 30, color: "hsl(var(--warning))" },
];

export default function CampusView() {
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  return (
    <>
      <PageHeader
        title="Campus View"
        description="Interactive campus exploration"
        icon={<Eye className="w-5 h-5 text-primary-foreground" />}
      />

      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={viewMode === "map" ? "default" : "outline"} onClick={() => setViewMode("map")}>
          <MapPin className="w-3.5 h-3.5 mr-1" /> Map View
        </Button>
        <Button size="sm" variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>
          <Building2 className="w-3.5 h-3.5 mr-1" /> List View
        </Button>
      </div>

      {viewMode === "map" ? (
        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-green-900/20 via-green-800/10 to-emerald-900/20 overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }} />

              {/* Roads */}
              <div className="absolute top-[50%] left-0 right-0 h-[2px] bg-muted-foreground/20" />
              <div className="absolute top-0 bottom-0 left-[45%] w-[2px] bg-muted-foreground/20" />

              {/* Campus boundary label */}
              <div className="absolute top-3 left-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                Campus Map — Campus Hive
              </div>

              {/* Hotspot pins */}
              {hotspots.map((spot) => (
                <motion.button
                  key={spot.id}
                  className="absolute z-10 group"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%, -50%)" }}
                  onClick={() => setSelected(spot)}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-background"
                      style={{ backgroundColor: spot.color }}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <motion.div
                      className="absolute -inset-2 rounded-full"
                      style={{ border: `2px solid ${spot.color}` }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2, delay: Math.random() }}
                    />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-semibold text-foreground bg-background/80 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {spot.name}
                    </div>
                  </div>
                </motion.button>
              ))}

              {/* Selected detail panel */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute top-4 right-4 w-72 bg-card border rounded-xl shadow-lg z-20"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-foreground text-sm">{selected.name}</h3>
                          <Badge variant="outline" className="text-[10px] mt-1 capitalize">{selected.type}</Badge>
                        </div>
                        <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{selected.description}</p>
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-primary">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{selected.timings}</span>
                      </div>
                      <Button size="sm" className="w-full mt-3 h-8 text-xs" onClick={() => {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(selected.name + " campus")}`, "_blank");
                      }}>
                        <MapPin className="w-3 h-3 mr-1" /> Get Directions
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspots.map((spot, i) => (
            <motion.div key={spot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer" onClick={() => { setSelected(spot); setViewMode("map"); }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: spot.color + "22" }}>
                      <Building2 className="w-4 h-4" style={{ color: spot.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{spot.name}</h3>
                      <Badge variant="outline" className="text-[9px] capitalize">{spot.type}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{spot.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-medium">
                    <Clock className="w-3 h-3" /> {spot.timings}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
