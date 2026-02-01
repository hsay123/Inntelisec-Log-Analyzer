import { generateText } from "ai";

export const maxDuration = 60;

interface ParsedLog {
  timestamp: Date;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  service: string;
  message: string;
  stackTrace?: string;
}

interface Anomaly {
  type: "spike" | "cascade" | "pattern";
  severity: "critical" | "high" | "medium";
  description: string;
  timestamp: Date;
  affectedServices: string[];
  relatedErrors: number;
}

// Parse log entries from text
function parseLogText(text: string): ParsedLog[] {
  const lines = text.split("\n").filter((line) => line.trim());
  const logs: ParsedLog[] = [];
  
  let currentLog: Partial<ParsedLog> | null = null;
  let stackTraceBuffer: string[] = [];

  for (const line of lines) {
    // Try to match common log formats
    // Format: timestamp [LEVEL] [Service] message
    const logMatch = line.match(
      /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\s*\[?(ERROR|WARN|INFO|DEBUG)\]?\s*\[?(\w+)\]?\s*(.+)$/i
    );

    if (logMatch) {
      // Save previous log if exists
      if (currentLog && currentLog.timestamp) {
        logs.push({
          timestamp: currentLog.timestamp,
          level: currentLog.level || "INFO",
          service: currentLog.service || "Unknown",
          message: currentLog.message || "",
          stackTrace: stackTraceBuffer.length > 0 ? stackTraceBuffer.join("\n") : undefined,
        });
        stackTraceBuffer = [];
      }

      currentLog = {
        timestamp: new Date(logMatch[1]),
        level: logMatch[2].toUpperCase() as ParsedLog["level"],
        service: logMatch[3],
        message: logMatch[4],
      };
    } else if (line.trim().startsWith("at ") || line.includes("Exception") || line.includes("Error:")) {
      // Stack trace line
      stackTraceBuffer.push(line);
    }
  }

  // Don't forget the last log
  if (currentLog && currentLog.timestamp) {
    logs.push({
      timestamp: currentLog.timestamp,
      level: currentLog.level || "INFO",
      service: currentLog.service || "Unknown",
      message: currentLog.message || "",
      stackTrace: stackTraceBuffer.length > 0 ? stackTraceBuffer.join("\n") : undefined,
    });
  }

  return logs;
}

// Detect anomalies in parsed logs
function detectAnomalies(logs: ParsedLog[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  // Group errors by time windows (5 minute windows)
  const windowMs = 5 * 60 * 1000;
  const errorsByWindow = new Map<number, ParsedLog[]>();
  
  for (const log of logs) {
    if (log.level === "ERROR" || log.level === "WARN") {
      const windowKey = Math.floor(log.timestamp.getTime() / windowMs);
      const existing = errorsByWindow.get(windowKey) || [];
      existing.push(log);
      errorsByWindow.set(windowKey, existing);
    }
  }

  // Calculate average error rate
  const windowCounts = Array.from(errorsByWindow.values()).map((w) => w.length);
  const avgCount = windowCounts.reduce((a, b) => a + b, 0) / (windowCounts.length || 1);

  // Detect spikes (> 3x average)
  for (const [windowKey, windowLogs] of errorsByWindow) {
    if (windowLogs.length > avgCount * 3 && windowLogs.length > 5) {
      const services = [...new Set(windowLogs.map((l) => l.service))];
      anomalies.push({
        type: "spike",
        severity: windowLogs.length > avgCount * 5 ? "critical" : "high",
        description: `Error rate spiked to ${Math.round(windowLogs.length / avgCount)}x the average rate`,
        timestamp: new Date(windowKey * windowMs),
        affectedServices: services,
        relatedErrors: windowLogs.length,
      });
    }
  }

  // Detect cascade failures (errors in multiple services within short time)
  const errorServices = new Map<string, Date[]>();
  for (const log of logs) {
    if (log.level === "ERROR") {
      const existing = errorServices.get(log.service) || [];
      existing.push(log.timestamp);
      errorServices.set(log.service, existing);
    }
  }

  // Check if multiple services started failing around the same time
  const serviceFailureStarts = new Map<string, Date>();
  for (const [service, times] of errorServices) {
    if (times.length > 3) {
      times.sort((a, b) => a.getTime() - b.getTime());
      serviceFailureStarts.set(service, times[0]);
    }
  }

  if (serviceFailureStarts.size > 2) {
    const startTimes = Array.from(serviceFailureStarts.values());
    startTimes.sort((a, b) => a.getTime() - b.getTime());
    
    // Check if failures started within 5 minutes of each other
    const first = startTimes[0];
    const last = startTimes[startTimes.length - 1];
    
    if (last.getTime() - first.getTime() < 10 * 60 * 1000) {
      anomalies.push({
        type: "cascade",
        severity: "critical",
        description: `Cascade failure detected across ${serviceFailureStarts.size} services`,
        timestamp: first,
        affectedServices: Array.from(serviceFailureStarts.keys()),
        relatedErrors: logs.filter((l) => l.level === "ERROR").length,
      });
    }
  }

  // Detect repeated error patterns
  const errorMessages = new Map<string, number>();
  for (const log of logs) {
    if (log.level === "ERROR") {
      // Normalize error message for pattern detection
      const normalized = log.message.replace(/\d+/g, "N").replace(/[a-f0-9-]{36}/gi, "UUID");
      errorMessages.set(normalized, (errorMessages.get(normalized) || 0) + 1);
    }
  }

  for (const [message, count] of errorMessages) {
    if (count > 10) {
      anomalies.push({
        type: "pattern",
        severity: count > 20 ? "high" : "medium",
        description: `Recurring error pattern detected: "${message.slice(0, 60)}..." (${count} occurrences)`,
        timestamp: logs.find((l) => l.level === "ERROR")?.timestamp || new Date(),
        affectedServices: [...new Set(logs.filter((l) => l.level === "ERROR").map((l) => l.service))],
        relatedErrors: count,
      });
    }
  }

  return anomalies;
}

export async function POST(req: Request) {
  try {
    const { logText } = await req.json();

    if (!logText || typeof logText !== "string") {
      return Response.json(
        { error: "Log text is required" },
        { status: 400 }
      );
    }

    // Parse logs
    const parsedLogs = parseLogText(logText);
    
    if (parsedLogs.length === 0) {
      return Response.json(
        { error: "Could not parse any valid log entries" },
        { status: 400 }
      );
    }

    // Detect anomalies
    const anomalies = detectAnomalies(parsedLogs);

    // If anomalies found, generate root cause hypotheses
    let rootCauses: { hypothesis: string; confidence: number; evidence: string[]; suggestedFix?: string }[] = [];
    
    if (anomalies.length > 0) {
      // Prepare context for AI
      const anomalyContext = anomalies
        .map((a) => `- ${a.type.toUpperCase()}: ${a.description} (Services: ${a.affectedServices.join(", ")})`)
        .join("\n");

      const topErrors = Array.from(
        parsedLogs
          .filter((l) => l.level === "ERROR")
          .reduce((acc, log) => {
            const key = log.message.slice(0, 100);
            acc.set(key, (acc.get(key) || 0) + 1);
            return acc;
          }, new Map<string, number>())
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([msg, count]) => `- ${msg} (${count}x)`)
        .join("\n");

      const result = await generateText({
        model: "anthropic/claude-sonnet-4-20250514",
        system: `You are a log analysis expert. Based on the parsed log data and detected anomalies provided, generate concise root-cause hypotheses. Be specific about timestamps, services, and error patterns. Format your response as a JSON array of objects with fields: hypothesis (string), confidence (number 0-100), evidence (array of strings), suggestedFix (string, optional).`,
        messages: [
          {
            role: "user",
            content: `Anomalies detected:
${anomalyContext}

Top errors:
${topErrors}

Total logs analyzed: ${parsedLogs.length}
Error count: ${parsedLogs.filter((l) => l.level === "ERROR").length}
Warning count: ${parsedLogs.filter((l) => l.level === "WARN").length}

Generate 2-3 root-cause hypotheses as a JSON array.`,
          },
        ],
        abortSignal: req.signal,
      });

      // Parse AI response
      try {
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          rootCauses = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, create a basic hypothesis
        rootCauses = [
          {
            hypothesis: "Analysis indicates potential system instability",
            confidence: 50,
            evidence: anomalies.map((a) => a.description),
          },
        ];
      }
    }

    return Response.json({
      totalLogs: parsedLogs.length,
      errorCount: parsedLogs.filter((l) => l.level === "ERROR").length,
      warningCount: parsedLogs.filter((l) => l.level === "WARN").length,
      anomalies: anomalies.map((a) => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
      })),
      rootCauses,
    });
  } catch (error) {
    console.error("Log analysis error:", error);
    return Response.json(
      { error: "Failed to analyze logs" },
      { status: 500 }
    );
  }
}
