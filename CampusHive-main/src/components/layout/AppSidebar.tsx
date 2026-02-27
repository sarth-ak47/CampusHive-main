import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Utensils, Mail, ShoppingBag, Search as SearchIcon,
  Car, Menu, X, Zap, Compass, Calendar, BookOpen, User, ShieldAlert,
  Sun, Moon, GraduationCap, Eye, Users, Building, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

const navGroups = [
  {
    label: "Overview",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/profile", icon: User, label: "Profile" },
    ],
  },
  {
    label: "Daily Pulse",
    items: [
      { to: "/mess-menu", icon: Utensils, label: "Mess Menu" },
      { to: "/mail-summarizer", icon: Mail, label: "Mail Summarizer" },
      { to: "/sos", icon: ShieldAlert, label: "SOS & Emergency" },
      { to: "/events", icon: CalendarDays, label: "Event Calendar" },
    ],
  },
  {
    label: "Exchange",
    items: [
      { to: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
      { to: "/lost-found", icon: SearchIcon, label: "Lost & Found" },
      { to: "/travel", icon: Car, label: "Travel Sharing" },
      { to: "/friends", icon: Users, label: "Buddy Finder" },
    ],
  },
  {
    label: "Explorer",
    items: [
      { to: "/nearby", icon: Compass, label: "Nearby Hub" },
      { to: "/campus-view", icon: Eye, label: "Campus View" },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/timetable", icon: Calendar, label: "Timetable" },
      { to: "/lms", icon: BookOpen, label: "LMS Lite" },
      { to: "/flashcards", icon: GraduationCap, label: "AI Flashcards" },
    ],
  },
  {
    label: "Hostel",
    items: [
      { to: "/hostel", icon: Building, label: "Hostel Dashboard" },
    ],
  },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">Campus Hive</span>
            <span className="text-[10px] text-sidebar-foreground">Campus Super-App</span>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                {group.label}
              </span>
            )}
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group relative",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
                      />
                    )}
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-sidebar-primary")} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-card shadow-card flex items-center justify-center border"
      >
        <Menu className="w-5 h-5 text-foreground" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[260px] bg-sidebar"
            style={{ background: "var(--gradient-sidebar)" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-sidebar-foreground hover:text-sidebar-accent-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
        style={{ background: "var(--gradient-sidebar)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
