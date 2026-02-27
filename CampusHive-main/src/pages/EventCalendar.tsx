import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, ChevronLeft, ChevronRight, MapPin, Clock,
  GraduationCap, PartyPopper, Palmtree, Megaphone, X, Loader2
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface CampusEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  venue: string;
  start_date: string;
  end_date: string | null;
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  exam: { icon: <GraduationCap className="w-3.5 h-3.5" />, color: "bg-destructive/10 text-destructive border-destructive/20" },
  fest: { icon: <PartyPopper className="w-3.5 h-3.5" />, color: "bg-accent/10 text-accent border-accent/20" },
  holiday: { icon: <Palmtree className="w-3.5 h-3.5" />, color: "bg-success/10 text-success border-success/20" },
  talk: { icon: <Megaphone className="w-3.5 h-3.5" />, color: "bg-info/10 text-info border-info/20" },
  event: { icon: <PartyPopper className="w-3.5 h-3.5" />, color: "bg-primary/10 text-primary border-primary/20" },
  general: { icon: <CalendarDays className="w-3.5 h-3.5" />, color: "bg-muted text-muted-foreground" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function EventCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const { data } = await supabase.from("campus_events").select("*").order("start_date");
    setEvents((data as CampusEvent[]) || []);
    setLoading(false);
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return events.filter((e) => {
      const start = new Date(e.start_date);
      const end = e.end_date ? new Date(e.end_date) : start;
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    });
  };

  return (
    <>
      <PageHeader title="Event Calendar" description="Campus events, exams & holidays" icon={<CalendarDays className="w-5 h-5 text-primary-foreground" />} />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(typeConfig).filter(([k]) => k !== "general").map(([key, cfg]) => (
          <Badge key={key} variant="outline" className={`text-[10px] capitalize ${cfg.color}`}>
            {cfg.icon} <span className="ml-1">{key}</span>
          </Badge>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="w-4 h-4" /></Button>
            <h2 className="text-base font-bold text-foreground">{MONTHS[month]} {year}</h2>
            <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="w-4 h-4" /></Button>
          </div>

          {loading ? (
            <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {days.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  return (
                    <div
                      key={day}
                      className={cn(
                        "min-h-[60px] sm:min-h-[80px] p-1 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                        isToday ? "border-primary bg-primary/5" : "border-border",
                        dayEvents.length > 0 && "bg-muted/20"
                      )}
                      onClick={() => dayEvents.length > 0 && setSelectedEvent(dayEvents[0])}
                    >
                      <span className={cn("text-xs font-medium", isToday ? "text-primary font-bold" : "text-foreground")}>{day}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayEvents.slice(0, 2).map((e) => {
                          const cfg = typeConfig[e.event_type] || typeConfig.general;
                          return (
                            <div key={e.id} className={cn("text-[8px] sm:text-[9px] px-1 py-0.5 rounded truncate border", cfg.color)}>
                              {e.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 2} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-xl shadow-lg w-full max-w-md p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selectedEvent.title}</h3>
                  <Badge variant="outline" className={cn("text-[10px] capitalize mt-1", (typeConfig[selectedEvent.event_type] || typeConfig.general).color)}>
                    {selectedEvent.event_type}
                  </Badge>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              {selectedEvent.description && <p className="text-sm text-muted-foreground mb-3">{selectedEvent.description}</p>}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(selectedEvent.start_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                {selectedEvent.venue && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedEvent.venue}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events List */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-foreground mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {events
            .filter((e) => new Date(e.start_date) >= today)
            .slice(0, 6)
            .map((e, i) => {
              const cfg = typeConfig[e.event_type] || typeConfig.general;
              return (
                <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="shadow-card hover:shadow-card-hover transition-all cursor-pointer" onClick={() => setSelectedEvent(e)}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", cfg.color)}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(e.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          {e.venue ? ` • ${e.venue}` : ""}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-[9px] capitalize", cfg.color)}>{e.event_type}</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
        </div>
      </div>
    </>
  );
}
