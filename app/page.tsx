"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RecentActivity } from "@/components/recent-activity";
import { FileText, Terminal, MessageSquare, AlertTriangle } from "lucide-react";

// Dynamically import charts to prevent SSR issues
const ActivityChart = dynamic(
  () => import("@/components/activity-chart").then((mod) => mod.ActivityChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 h-[380px] animate-pulse">
      <div className="h-4 bg-secondary rounded w-32 mb-2" />
      <div className="h-3 bg-secondary rounded w-48 mb-6" />
      <div className="h-[280px] bg-secondary/50 rounded" />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Overview of your document QA and log analysis activity"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Documents Indexed"
          value={12}
          icon={FileText}
          color="cyan"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Questions Asked"
          value={156}
          icon={MessageSquare}
          color="green"
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard
          title="Log Files Analyzed"
          value={8}
          icon={Terminal}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Anomalies Detected"
          value={24}
          icon={AlertTriangle}
          color="amber"
          trend={{ value: 12, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Suspense fallback={<ChartSkeleton />}>
          <ActivityChart />
        </Suspense>
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <QuickActionCard
          title="Document QA"
          description="Upload documents and ask questions using AI-powered retrieval"
          href="/document-qa"
          icon={FileText}
          color="cyan"
        />
        <QuickActionCard
          title="Log Analyzer"
          description="Analyze log files for errors, anomalies, and root causes"
          href="/log-analyzer"
          icon={Terminal}
          color="purple"
        />
      </div>
    </AppShell>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: "cyan" | "purple";
}) {
  const colorClasses = {
    cyan: "bg-primary/10 text-primary group-hover:bg-primary/20",
    purple: "bg-chart-5/10 text-chart-5 group-hover:bg-chart-5/20",
  };

  return (
    <Link
      href={href}
      className="group card-hover flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-all"
    >
      <div className={`rounded-lg p-3 transition-colors ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
