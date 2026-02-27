import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Utensils, Mail, ShoppingBag, Car,
  Compass, Calendar, BookOpen, Bell, Clock,
  ArrowRight, CloudRain, Sun, Cloud, Droplets, ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const quickLinks = [
  { to: "/mess-menu", icon: Utensils, label: "Mess Menu", desc: "Today's meals", color: "text-primary" },
  { to: "/mail-summarizer", icon: Mail, label: "Mail AI", desc: "Summarize emails", color: "text-accent" },
  { to: "/marketplace", icon: ShoppingBag, label: "Marketplace", desc: "Buy & sell", color: "text-info" },
  { to: "/timetable", icon: Calendar, label: "Timetable", desc: "Your schedule", color: "text-success" },
  { to: "/travel", icon: Car, label: "Cab Pool", desc: "Share rides", color: "text-warning" },
  { to: "/sos", icon: ShieldAlert, label: "SOS", desc: "Emergency", color: "text-destructive" },
];

const upcomingClasses = [
  { time: "09:00", subject: "Data Structures", room: "LH-301", type: "Lecture" },
  { time: "11:00", subject: "Operating Systems", room: "CR-205", type: "Lab" },
  { time: "14:00", subject: "Linear Algebra", room: "LH-102", type: "Lecture" },
];

// Mock weather
const weather = {
  temp: 24,
  condition: "Partly Cloudy",
  rainChance: 35,
  icon: Cloud,
  suggestion: "☀️ Low rain chance — no umbrella needed",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [listingCount, setListingCount] = useState(0);
  const [tripCount, setTripCount] = useState(0);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Student";

  useEffect(() => {
    supabase.from("marketplace_listings").select("id", { count: "exact", head: true }).then(({ count }) => setListingCount(count || 0));
    supabase.from("travel_trips").select("id", { count: "exact", head: true }).then(({ count }) => setTripCount(count || 0));
  }, []);

  return (
    <>
      <PageHeader
        title={`Hey, ${firstName} 👋`}
        description="Your campus at a glance"
        icon={<LayoutDashboard className="w-5 h-5 text-primary-foreground" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Listings" value={listingCount} icon={ShoppingBag} trend="Marketplace" variant="primary" />
        <StatCard title="Classes Today" value={3} icon={Calendar} trend="Next: 09:00" />
        <StatCard title="Unread Mails" value={12} icon={Mail} trend="4 urgent" variant="accent" />
        <StatCard title="Cab Pools" value={tripCount} icon={Car} trend="Active trips" />
      </div>

      {/* Quick Links */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {quickLinks.map((link) => (
          <motion.div key={link.to} variants={item}>
            <Link
              to={link.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-foreground">{link.label}</div>
                <div className="text-[10px] text-muted-foreground">{link.desc}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Weather + Schedule */}
        <div className="lg:col-span-3 space-y-6">
          {/* Weather Widget */}
          <Card className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <weather.icon className="w-8 h-8 text-info" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{weather.temp}°C</div>
                    <p className="text-xs text-muted-foreground">{weather.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Droplets className="w-4 h-4 text-info" /> {weather.rainChance}% rain
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{weather.suggestion}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingClasses.map((cls, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="text-center min-w-[48px]">
                    <div className="text-sm font-bold text-primary">{cls.time}</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{cls.subject}</p>
                    <p className="text-[11px] text-muted-foreground">{cls.room} · {cls.type}</p>
                  </div>
                </motion.div>
              ))}
              <Link to="/timetable" className="flex items-center justify-center gap-1 text-xs text-primary font-medium hover:underline pt-2">
                View full schedule <ArrowRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Announcements */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { title: "Mid-Semester Exams Schedule Released", category: "Academic", time: "2h ago", priority: "high" },
              { title: "Cultural Fest Registrations Open", category: "Events", time: "5h ago", priority: "medium" },
              { title: "Library Hours Extended for Exam Week", category: "Admin", time: "1d ago", priority: "low" },
              { title: "Guest Lecture: AI in Healthcare — Fri 3PM", category: "Academic", time: "1d ago", priority: "medium" },
            ].map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="mt-0.5">
                  <div className={`w-2 h-2 rounded-full ${a.priority === "high" ? "bg-destructive" : a.priority === "medium" ? "bg-warning" : "bg-muted-foreground/30"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] h-5">{a.category}</Badge>
                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
