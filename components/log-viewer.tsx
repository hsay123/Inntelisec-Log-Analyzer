"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/app/log-analyzer/page";
import { format } from "date-fns";

interface LogViewerProps {
  entries: LogEntry[];
}

const levelColors = {
  ERROR: "log-error bg-destructive/10",
  WARN: "log-warn bg-warning/10",
  INFO: "log-info bg-primary/10",
  DEBUG: "log-debug bg-muted",
};

const levelBadgeColors = {
  ERROR: "bg-destructive/20 text-destructive border-destructive/30",
  WARN: "bg-warning/20 text-warning border-warning/30",
  INFO: "bg-primary/20 text-primary border-primary/30",
  DEBUG: "bg-muted text-muted-foreground border-muted-foreground/30",
};

export function LogViewer({ entries }: LogViewerProps) {
  const [search, setSearch] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG",
  ]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        search === "" ||
        entry.message.toLowerCase().includes(search.toLowerCase()) ||
        entry.service.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = selectedLevels.includes(entry.level);
      return matchesSearch && matchesLevel;
    });
  }, [entries, search, selectedLevels]);

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const stats = useMemo(() => {
    const counts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
    entries.forEach((e) => counts[e.level]++);
    return counts;
  }, [entries]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-card-foreground">Log Entries</CardTitle>
            <CardDescription>
              {filteredEntries.length} of {entries.length} entries
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs..."
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                {(["ERROR", "WARN", "INFO", "DEBUG"] as const).map((level) => (
                  <DropdownMenuCheckboxItem
                    key={level}
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={() => toggleLevel(level)}
                  >
                    <Badge
                      variant="outline"
                      className={cn("mr-2", levelBadgeColors[level])}
                    >
                      {level}
                    </Badge>
                    {stats[level]}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] rounded-lg border border-border bg-background">
          <div className="font-mono text-xs">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedIds.has(entry.id);
              const hasDetails = entry.stackTrace || entry.requestId;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "border-b border-border last:border-b-0 transition-colors",
                    levelColors[entry.level]
                  )}
                >
                  <button
                    type="button"
                    onClick={() => hasDetails && toggleExpanded(entry.id)}
                    className={cn(
                      "w-full text-left p-3 flex items-start gap-3",
                      hasDetails && "cursor-pointer hover:bg-secondary/50"
                    )}
                  >
                    {hasDetails ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}

                    <span className="text-muted-foreground shrink-0 w-36">
                      {format(entry.timestamp, "HH:mm:ss.SSS")}
                    </span>

                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 text-[10px] w-14 justify-center",
                        levelBadgeColors[entry.level]
                      )}
                    >
                      {entry.level}
                    </Badge>

                    <span className="text-primary shrink-0 w-32 truncate">
                      [{entry.service}]
                    </span>

                    <span className="text-foreground flex-1 break-all">
                      {entry.message}
                    </span>
                  </button>

                  {isExpanded && hasDetails && (
                    <div className="px-3 pb-3 pl-10 space-y-2">
                      {entry.requestId && (
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Request ID:</span>
                          <span className="text-foreground">{entry.requestId}</span>
                        </div>
                      )}
                      {entry.host && (
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Host:</span>
                          <span className="text-foreground">{entry.host}</span>
                        </div>
                      )}
                      {entry.stackTrace && (
                        <div className="mt-2">
                          <span className="text-muted-foreground block mb-1">
                            Stack Trace:
                          </span>
                          <pre className="text-destructive/80 whitespace-pre-wrap bg-destructive/5 rounded p-2">
                            {entry.stackTrace}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
