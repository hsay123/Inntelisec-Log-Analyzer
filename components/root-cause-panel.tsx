"use client";

import { Lightbulb, CheckCircle, Wrench, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { RootCause } from "@/app/log-analyzer/page";
import { cn } from "@/lib/utils";

interface RootCausePanelProps {
  rootCauses: RootCause[];
}

export function RootCausePanel({ rootCauses }: RootCausePanelProps) {
  if (rootCauses.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <Lightbulb className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-1">
            No root causes identified
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Not enough data to generate root cause hypotheses. Try analyzing more
            logs with detected anomalies.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warning" />
            Root Cause Analysis
          </CardTitle>
          <CardDescription>
            AI-generated hypotheses based on detected anomalies and error patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {rootCauses.map((cause, index) => {
            const confidenceColor =
              cause.confidence >= 80
                ? "text-success"
                : cause.confidence >= 60
                ? "text-warning"
                : "text-destructive";

            return (
              <div
                key={cause.id}
                className="rounded-lg border border-border bg-secondary/30 p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className="h-7 w-7 rounded-full p-0 flex items-center justify-center border-primary text-primary shrink-0"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <h3 className="font-medium text-card-foreground leading-tight">
                        {cause.hypothesis}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      Confidence Score
                    </span>
                    <span className={cn("font-semibold", confidenceColor)}>
                      {cause.confidence}%
                    </span>
                  </div>
                  <Progress value={cause.confidence} className="h-2" />
                </div>

                {/* Evidence */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-card-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Supporting Evidence
                  </h4>
                  <ul className="space-y-1.5">
                    {cause.evidence.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-1.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Fix */}
                {cause.suggestedFix && (
                  <div className="rounded-lg bg-success/10 border border-success/20 p-4">
                    <h4 className="text-sm font-medium text-success flex items-center gap-1.5 mb-2">
                      <Wrench className="h-4 w-4" />
                      Suggested Fix
                    </h4>
                    <p className="text-sm text-success/90">{cause.suggestedFix}</p>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
