"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Terminal, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "document",
    action: "Document uploaded",
    description: "employee_handbook.pdf",
    time: "2 min ago",
    status: "success",
  },
  {
    id: 2,
    type: "query",
    action: "Question answered",
    description: "What is the maternity leave policy?",
    time: "5 min ago",
    status: "success",
  },
  {
    id: 3,
    type: "log",
    action: "Log analysis complete",
    description: "app_server.log - 24 anomalies detected",
    time: "12 min ago",
    status: "warning",
  },
  {
    id: 4,
    type: "anomaly",
    action: "Critical anomaly detected",
    description: "DatabaseService connection timeout spike",
    time: "15 min ago",
    status: "error",
  },
  {
    id: 5,
    type: "document",
    action: "Document indexed",
    description: "product_spec_v2.txt",
    time: "1 hour ago",
    status: "success",
  },
];

const iconMap = {
  document: FileText,
  query: CheckCircle,
  log: Terminal,
  anomaly: AlertTriangle,
};

const statusColors = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error: "bg-destructive/10 text-destructive",
};

export function RecentActivity() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
        <CardDescription>Latest actions across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type as keyof typeof iconMap];
            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-secondary/50"
              >
                <div
                  className={cn(
                    "rounded-lg p-2",
                    statusColors[activity.status as keyof typeof statusColors]
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
