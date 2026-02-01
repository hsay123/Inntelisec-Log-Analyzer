"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "cyan" | "green" | "amber" | "red" | "purple";
}

const colorMap = {
  cyan: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
  },
  green: {
    bg: "bg-success/10",
    text: "text-success",
    border: "border-success/20",
  },
  amber: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  red: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
  },
  purple: {
    bg: "bg-chart-5/10",
    text: "text-chart-5",
    border: "border-chart-5/20",
  },
};

export function StatCard({
  title,
  value,
  suffix = "",
  prefix = "",
  icon: Icon,
  trend,
  color = "cyan",
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorMap[color];

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="card-hover rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground animate-count">
            {prefix}
            {displayValue.toLocaleString()}
            {suffix}
          </p>
          {trend && (
            <p
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%{" "}
              <span className="text-muted-foreground">vs last period</span>
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-3", colors.bg)}>
          <Icon className={cn("h-6 w-6", colors.text)} />
        </div>
      </div>
    </div>
  );
}
