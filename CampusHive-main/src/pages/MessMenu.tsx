import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Utensils, Star, ThumbsUp, Leaf, Flame, Clock, Filter } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MealType = "breakfast" | "lunch" | "dinner";

const mealsData: Record<MealType, { items: { name: string; tags: string[]; rating: number; calories: number; popular?: boolean }[] }> = {
  breakfast: {
    items: [
      { name: "Masala Dosa", tags: ["vegan", "south-indian"], rating: 4.5, calories: 250, popular: true },
      { name: "Poha", tags: ["vegan", "light"], rating: 4.0, calories: 180 },
      { name: "Bread Omelette", tags: ["egg"], rating: 3.8, calories: 320 },
      { name: "Idli Sambar", tags: ["vegan", "south-indian"], rating: 4.2, calories: 200 },
      { name: "Fresh Fruit Bowl", tags: ["vegan", "healthy"], rating: 4.6, calories: 120 },
    ],
  },
  lunch: {
    items: [
      { name: "Paneer Butter Masala", tags: ["vegetarian"], rating: 4.7, calories: 450, popular: true },
      { name: "Chicken Biryani", tags: ["non-veg"], rating: 4.8, calories: 550, popular: true },
      { name: "Dal Tadka + Rice", tags: ["vegan"], rating: 4.1, calories: 380 },
      { name: "Chole Bhature", tags: ["vegetarian"], rating: 4.3, calories: 500 },
      { name: "Mixed Veg Thali", tags: ["vegan", "healthy"], rating: 3.9, calories: 420 },
    ],
  },
  dinner: {
    items: [
      { name: "Rajma Chawal", tags: ["vegan"], rating: 4.4, calories: 400, popular: true },
      { name: "Butter Chicken", tags: ["non-veg"], rating: 4.9, calories: 520 },
      { name: "Aloo Paratha", tags: ["vegetarian"], rating: 4.2, calories: 350 },
      { name: "Soup + Sandwich", tags: ["vegetarian", "light"], rating: 3.7, calories: 280 },
      { name: "Pasta Alfredo", tags: ["vegetarian"], rating: 4.0, calories: 460 },
    ],
  },
};

const mealTimes: { key: MealType; label: string; time: string; icon: string }[] = [
  { key: "breakfast", label: "Breakfast", time: "7:30 – 9:30 AM", icon: "☀️" },
  { key: "lunch", label: "Lunch", time: "12:00 – 2:00 PM", icon: "🌤️" },
  { key: "dinner", label: "Dinner", time: "7:00 – 9:00 PM", icon: "🌙" },
];

const tagColors: Record<string, string> = {
  vegan: "bg-success/10 text-success border-success/20",
  vegetarian: "bg-success/10 text-success border-success/20",
  "non-veg": "bg-destructive/10 text-destructive border-destructive/20",
  egg: "bg-warning/10 text-warning border-warning/20",
  healthy: "bg-info/10 text-info border-info/20",
  light: "bg-primary/10 text-primary border-primary/20",
  "south-indian": "bg-accent/10 text-accent border-accent/20",
};

export default function MessMenu() {
  const [activeMeal, setActiveMeal] = useState<MealType>("lunch");
  const [filter, setFilter] = useState<string | null>(null);

  const items = mealsData[activeMeal].items.filter(
    (item) => !filter || item.tags.includes(filter)
  );

  return (
    <>
      <PageHeader
        title="Mess Menu"
        description="Today's dining options"
        icon={<Utensils className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Meal Type Tabs */}
      <div className="flex gap-2 mb-6">
        {mealTimes.map((meal) => (
          <button
            key={meal.key}
            onClick={() => setActiveMeal(meal.key)}
            className={cn(
              "flex-1 relative px-4 py-3 rounded-xl text-sm font-medium transition-all border",
              activeMeal === meal.key
                ? "bg-primary text-primary-foreground border-primary shadow-glow"
                : "bg-card text-muted-foreground border-border hover:border-primary/30"
            )}
          >
            <span className="text-lg mr-1">{meal.icon}</span>
            <span className="hidden sm:inline">{meal.label}</span>
            <div className="text-[10px] opacity-70 mt-0.5">{meal.time}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          size="sm"
          variant={filter === null ? "default" : "outline"}
          onClick={() => setFilter(null)}
          className="h-7 text-xs"
        >
          All
        </Button>
        {["vegan", "vegetarian", "non-veg", "healthy"].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(filter === f ? null : f)}
            className="h-7 text-xs capitalize"
          >
            {f === "vegan" && <Leaf className="w-3 h-3 mr-1" />}
            {f}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <motion.div
        key={activeMeal + (filter || "")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 group overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                        {item.popular && (
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px] h-5">
                            <Flame className="w-2.5 h-2.5 mr-0.5" /> Hot
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-warning">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-semibold">{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn("text-[10px] px-2 py-0.5 rounded-full border capitalize", tagColors[tag] || "bg-muted text-muted-foreground")}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {item.calories} cal
                    </span>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <ThumbsUp className="w-3 h-3" /> Rate
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
