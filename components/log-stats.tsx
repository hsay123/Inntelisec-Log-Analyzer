"use client";

import { StatCard } from "@/components/stat-card";
import { FileText, AlertTriangle, AlertCircle, Lightbulb } from "lucide-react";
import type { LogAnalysis } from "@/app/log-analyzer/page";

interface LogStatsProps {
  analysis: LogAnalysis;
}

export function LogStats({ analysis }: LogStatsProps) {
  const totalErrors = analysis.entries.filter((e) => e.level === "ERROR").length;
  const totalWarnings = analysis.entries.filter((e) => e.level === "WARN").length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Log Entries"
        value={analysis.entries.length}
        icon={FileText}
        color="cyan"
      />
      <StatCard
        title="Errors"
        value={totalErrors}
        icon={AlertCircle}
        color="red"
      />
      <StatCard
        title="Warnings"
        value={totalWarnings}
        icon={AlertTriangle}
        color="amber"
      />
      <StatCard
        title="Root Causes"
        value={analysis.rootCauses.length}
        icon={Lightbulb}
        color="green"
      />
    </div>
  );
}
