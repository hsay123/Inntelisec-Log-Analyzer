"use client";

import {
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  Server,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Anomaly } from "@/app/log-analyzer/page";
import { format, formatDistanceStrict } from "date-fns";

interface AnomalyTimelineProps {
  anomalies: Anomaly[];
  compact?: boolean;
}

const severityColors = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive/20 text-destructive border-destructive/30",
  },
  high: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    badge: "bg-warning/20 text-warning border-warning/30",
  },
  medium: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    badge: "bg-primary/20 text-primary border-primary/30",
  },
};

const typeIcons = {
  spike: TrendingUp,
  cascade: Zap,
  pattern: AlertTriangle,
};

const typeLabels = {
  spike: "Error Spike",
  cascade: "Cascade Failure",
  pattern: "Pattern Detected",
};

export function AnomalyTimeline({ anomalies, compact }: AnomalyTimelineProps) {
  if (anomalies.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-success/10 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-1">
            No anomalies detected
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Your logs look healthy! No unusual patterns or error spikes were found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Detected Anomalies
        </CardTitle>
        <CardDescription>
          {anomalies.length} anomal{anomalies.length !== 1 ? "ies" : "y"} detected
          in the analyzed logs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

          {anomalies.map((anomaly) => {
            const colors = severityColors[anomaly.severity];
            const Icon = typeIcons[anomaly.type];
            const duration = anomaly.endTimestamp
              ? formatDistanceStrict(anomaly.endTimestamp, anomaly.timestamp)
              : null;

            return (
              <div key={anomaly.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                    colors.bg,
                    colors.border
                  )}
                >
                  <Icon className={cn("h-5 w-5", colors.text)} />
                </div>

                {/* Content */}
                <div
                  className={cn(
                    "flex-1 rounded-lg border p-4",
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={colors.badge}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {typeLabels[anomaly.type]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(anomaly.timestamp, "HH:mm:ss")}
                      {duration && ` (${duration})`}
                    </div>
                  </div>

                  <p className="text-sm text-card-foreground mb-3">
                    {anomaly.description}
                  </p>

                  {!compact && (
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Server className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Services:</span>
                        <span className="text-card-foreground">
                          {anomaly.affectedServices.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Related Errors:</span>
                        <span className={colors.text}>{anomaly.relatedErrors}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
