import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

interface ClassSlot {
  subject: string;
  room: string;
  type: "lecture" | "lab" | "tutorial";
  startTime: string;
  endTime: string;
  day: number; // 0=Mon
}

const mockSchedule: ClassSlot[] = [
  { subject: "Data Structures", room: "LH-301", type: "lecture", startTime: "09:00", endTime: "10:00", day: 0 },
  { subject: "Data Structures", room: "LH-301", type: "lecture", startTime: "09:00", endTime: "10:00", day: 2 },
  { subject: "Operating Systems", room: "CR-205", type: "lab", startTime: "11:00", endTime: "13:00", day: 0 },
  { subject: "Linear Algebra", room: "LH-102", type: "lecture", startTime: "14:00", endTime: "15:00", day: 0 },
  { subject: "Linear Algebra", room: "LH-102", type: "lecture", startTime: "14:00", endTime: "15:00", day: 3 },
  { subject: "DBMS", room: "LH-205", type: "lecture", startTime: "10:00", endTime: "11:00", day: 1 },
  { subject: "DBMS", room: "Lab-3", type: "lab", startTime: "14:00", endTime: "16:00", day: 4 },
  { subject: "English", room: "LH-101", type: "tutorial", startTime: "08:00", endTime: "09:00", day: 1 },
  { subject: "Operating Systems", room: "LH-302", type: "lecture", startTime: "11:00", endTime: "12:00", day: 3 },
  { subject: "DSA Tutorial", room: "CR-101", type: "tutorial", startTime: "15:00", endTime: "16:00", day: 2 },
  { subject: "Physics Lab", room: "Lab-1", type: "lab", startTime: "09:00", endTime: "11:00", day: 4 },
  { subject: "Probability", room: "LH-201", type: "lecture", startTime: "10:00", endTime: "11:00", day: 2 },
  { subject: "Probability", room: "LH-201", type: "lecture", startTime: "10:00", endTime: "11:00", day: 4 },
];

const typeStyles: Record<string, string> = {
  lecture: "bg-primary/10 border-primary/20 text-primary",
  lab: "bg-accent/10 border-accent/20 text-accent",
  tutorial: "bg-info/10 border-info/20 text-info",
};

export default function Timetable() {
  const [view, setView] = useState<"week" | "today">("week");
  const todayIdx = new Date().getDay() - 1; // 0=Mon

  const getSlotForCell = (day: number, time: string): ClassSlot | undefined => {
    return mockSchedule.find(
      (s) => s.day === day && s.startTime <= time && s.endTime > time
    );
  };

  const isSlotStart = (day: number, time: string): boolean => {
    return mockSchedule.some((s) => s.day === day && s.startTime === time);
  };

  const getSlotSpan = (slot: ClassSlot): number => {
    const start = parseInt(slot.startTime.split(":")[0]);
    const end = parseInt(slot.endTime.split(":")[0]);
    return end - start;
  };

  const todayClasses = mockSchedule
    .filter((s) => s.day === (todayIdx >= 0 && todayIdx < 6 ? todayIdx : 0))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <>
      <PageHeader
        title="Timetable"
        description="Your class schedule"
        icon={<Calendar className="w-5 h-5 text-primary-foreground" />}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant={view === "today" ? "default" : "outline"} onClick={() => setView("today")}>Today</Button>
            <Button size="sm" variant={view === "week" ? "default" : "outline"} onClick={() => setView("week")}>Week</Button>
          </div>
        }
      />

      {view === "today" ? (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {days[todayIdx >= 0 && todayIdx < 6 ? todayIdx : 0]}'s Classes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No classes today! 🎉</p>
            ) : (
              todayClasses.map((cls, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn("flex items-center gap-4 p-4 rounded-xl border", typeStyles[cls.type])}
                >
                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-bold">{cls.startTime}</div>
                    <div className="text-[10px] opacity-60">{cls.endTime}</div>
                  </div>
                  <div className="w-px h-10 bg-current opacity-20" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{cls.subject}</p>
                    <p className="text-xs opacity-70">{cls.room} · {cls.type}</p>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-card overflow-x-auto">
          <CardContent className="p-0">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b">
                <div className="p-3 text-xs text-muted-foreground font-medium border-r" />
                {days.map((d, i) => (
                  <div key={d} className={cn("p-3 text-xs font-semibold text-center border-r last:border-r-0", i === todayIdx && "bg-primary/5 text-primary")}>
                    {d}
                  </div>
                ))}
              </div>
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-[60px_repeat(6,1fr)] border-b last:border-b-0">
                  <div className="p-2 text-[10px] text-muted-foreground font-medium border-r flex items-start justify-end pr-2 pt-1">{time}</div>
                  {days.map((_, dayIdx) => {
                    const slot = getSlotForCell(dayIdx, time);
                    const isStart = isSlotStart(dayIdx, time);

                    if (slot && !isStart) return <div key={dayIdx} className="border-r last:border-r-0" />;

                    return (
                      <div key={dayIdx} className={cn("border-r last:border-r-0 p-0.5 min-h-[44px]", dayIdx === todayIdx && "bg-primary/[0.02]")}>
                        {slot && isStart && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "rounded-lg p-2 text-[11px] border h-full",
                              typeStyles[slot.type]
                            )}
                            style={{ minHeight: `${getSlotSpan(slot) * 44 - 4}px` }}
                          >
                            <div className="font-semibold truncate">{slot.subject}</div>
                            <div className="opacity-60 text-[10px]">{slot.room}</div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
