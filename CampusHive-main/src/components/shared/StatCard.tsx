import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "accent" | "success";
}

const variantStyles = {
  default: "bg-card border",
  primary: "gradient-primary border-0 text-primary-foreground [&_.stat-label]:text-primary-foreground/70 [&_.stat-trend]:text-primary-foreground/80",
  accent: "gradient-accent border-0 text-accent-foreground [&_.stat-label]:text-accent-foreground/70 [&_.stat-trend]:text-accent-foreground/80",
  success: "bg-success border-0 text-success-foreground [&_.stat-label]:text-success-foreground/70 [&_.stat-trend]:text-success-foreground/80",
};

export default function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="stat-label text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold">{value}</span>
        {trend && <span className="stat-trend ml-2 text-xs text-muted-foreground">{trend}</span>}
      </div>
    </motion.div>
  );
}
