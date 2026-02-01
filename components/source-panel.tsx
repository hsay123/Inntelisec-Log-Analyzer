"use client";

import { X, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Source } from "@/app/document-qa/page";
import { cn } from "@/lib/utils";

interface SourcePanelProps {
  sources: Source[] | null;
  onClose: () => void;
}

export function SourcePanel({ sources, onClose }: SourcePanelProps) {
  if (!sources) {
    return (
      <Card className="border-border bg-card sticky top-6">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Source Citations
          </CardTitle>
          <CardDescription>
            Select a message with sources to view retrieval details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-secondary p-3 mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No sources selected
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card sticky top-6">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Source Citations
          </CardTitle>
          <CardDescription>
            {sources.length} chunk{sources.length !== 1 ? "s" : ""} retrieved
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sources.map((source, index) => (
              <SourceCard key={index} source={source} rank={index + 1} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function SourceCard({ source, rank }: { source: Source; rank: number }) {
  const similarityPercent = Math.round(source.similarity * 100);
  
  const getConfidenceColor = (percent: number) => {
    if (percent >= 80) return "text-success";
    if (percent >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs border-primary text-primary"
          >
            {rank}
          </Badge>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-card-foreground truncate max-w-[180px]">
              {source.docName}
            </span>
            {source.section && (
              <span className="text-xs text-muted-foreground">
                {source.section}
              </span>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          Chunk #{source.chunkId}
        </Badge>
      </div>

      {/* Similarity Score */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Similarity Score</span>
          <span className={cn("font-medium", getConfidenceColor(similarityPercent))}>
            {similarityPercent}%
          </span>
        </div>
        <Progress
          value={similarityPercent}
          className="h-1.5"
        />
      </div>

      {/* Text Preview */}
      <div className="rounded-md bg-background p-3 border border-border">
        <p className="text-xs text-muted-foreground font-mono leading-relaxed line-clamp-4">
          {source.text}
        </p>
      </div>
    </div>
  );
}
