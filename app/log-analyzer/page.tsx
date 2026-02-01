"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { LogUploader } from "@/components/log-uploader";
import { LogViewer } from "@/components/log-viewer";
import { AnomalyTimeline } from "@/components/anomaly-timeline";
import { ErrorChart } from "@/components/error-chart";
import { RootCausePanel } from "@/components/root-cause-panel";
import { LogStats } from "@/components/log-stats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, RefreshCw } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "ERROR" | "WARN" | "INFO" | "DEBUG";
  service: string;
  message: string;
  stackTrace?: string;
  requestId?: string;
  host?: string;
}

export interface Anomaly {
  id: string;
  type: "spike" | "cascade" | "pattern";
  severity: "critical" | "high" | "medium";
  timestamp: Date;
  endTimestamp?: Date;
  description: string;
  affectedServices: string[];
  relatedErrors: number;
}

export interface RootCause {
  id: string;
  hypothesis: string;
  confidence: number;
  evidence: string[];
  suggestedFix?: string;
}

export interface LogAnalysis {
  entries: LogEntry[];
  anomalies: Anomaly[];
  rootCauses: RootCause[];
  errorsByService: { service: string; count: number }[];
  errorsByTime: { time: string; errors: number; warns: number }[];
  topErrors: { message: string; count: number; firstSeen: Date; lastSeen: Date }[];
}

// Generate sample log data with cascade failure pattern
function generateSampleData(): LogAnalysis {
  const entries: LogEntry[] = [];
  const baseTime = new Date();
  baseTime.setHours(baseTime.getHours() - 2);

  // Normal traffic (lines 1-100)
  for (let i = 0; i < 100; i++) {
    const time = new Date(baseTime.getTime() + i * 30000);
    const services = ["APIGateway", "UserService", "PaymentService", "NotificationService"];
    const service = services[Math.floor(Math.random() * services.length)];
    
    entries.push({
      id: `log-${i}`,
      timestamp: time,
      level: Math.random() > 0.9 ? "DEBUG" : "INFO",
      service,
      message: `Request processed successfully - ${Math.floor(Math.random() * 100)}ms`,
      requestId: `req-${crypto.randomUUID().slice(0, 8)}`,
      host: `server-${Math.floor(Math.random() * 3) + 1}`,
    });
  }

  // Database issues start (lines 101-150)
  for (let i = 100; i < 150; i++) {
    const time = new Date(baseTime.getTime() + i * 30000);
    const isError = i > 110;
    
    entries.push({
      id: `log-${i}`,
      timestamp: time,
      level: isError ? "ERROR" : "WARN",
      service: "DatabaseService",
      message: isError 
        ? "ConnectionTimeoutException: Unable to establish connection to primary database"
        : "Connection pool reaching capacity limit",
      stackTrace: isError ? `at com.intellisync.db.ConnectionPool.acquire(ConnectionPool.java:${142 + i})\nat com.intellisync.db.QueryExecutor.execute(QueryExecutor.java:89)\nat com.intellisync.api.UserRepository.findById(UserRepository.java:45)` : undefined,
      host: "db-primary",
    });
  }

  // Auth cascade (lines 151-200)
  for (let i = 150; i < 200; i++) {
    const time = new Date(baseTime.getTime() + i * 30000);
    
    entries.push({
      id: `log-${i}`,
      timestamp: time,
      level: "ERROR",
      service: "AuthService",
      message: "401 Unauthorized - Session validation failed due to database unavailability",
      requestId: `req-${crypto.randomUUID().slice(0, 8)}`,
      host: "auth-server-1",
    });
  }

  // API Gateway 500s (lines 201-250)
  for (let i = 200; i < 250; i++) {
    const time = new Date(baseTime.getTime() + i * 30000);
    
    entries.push({
      id: `log-${i}`,
      timestamp: time,
      level: "ERROR",
      service: "APIGateway",
      message: "500 Internal Server Error - Upstream service unavailable",
      stackTrace: `at com.intellisync.gateway.ProxyHandler.forward(ProxyHandler.java:${78 + i % 10})\nat com.intellisync.gateway.RequestFilter.doFilter(RequestFilter.java:52)`,
      requestId: `req-${crypto.randomUUID().slice(0, 8)}`,
      host: "gateway-1",
    });
  }

  // Recovery (lines 251-300)
  for (let i = 250; i < 300; i++) {
    const time = new Date(baseTime.getTime() + i * 30000);
    const services = ["APIGateway", "UserService", "DatabaseService", "AuthService"];
    const service = services[Math.floor(Math.random() * services.length)];
    
    entries.push({
      id: `log-${i}`,
      timestamp: time,
      level: i < 260 ? "WARN" : "INFO",
      service,
      message: i < 260 
        ? "Service recovering - clearing connection backlog"
        : `Request processed successfully - ${Math.floor(Math.random() * 100)}ms`,
      host: `server-${Math.floor(Math.random() * 3) + 1}`,
    });
  }

  const anomalies: Anomaly[] = [
    {
      id: "anomaly-1",
      type: "spike",
      severity: "critical",
      timestamp: new Date(baseTime.getTime() + 110 * 30000),
      endTimestamp: new Date(baseTime.getTime() + 150 * 30000),
      description: "DatabaseService connection timeout errors spiked to 3x normal rate",
      affectedServices: ["DatabaseService"],
      relatedErrors: 40,
    },
    {
      id: "anomaly-2",
      type: "cascade",
      severity: "critical",
      timestamp: new Date(baseTime.getTime() + 150 * 30000),
      endTimestamp: new Date(baseTime.getTime() + 250 * 30000),
      description: "Cascade failure: DB issues triggered Auth and API Gateway failures",
      affectedServices: ["DatabaseService", "AuthService", "APIGateway"],
      relatedErrors: 150,
    },
    {
      id: "anomaly-3",
      type: "pattern",
      severity: "high",
      timestamp: new Date(baseTime.getTime() + 200 * 30000),
      description: "Repeated 500 Internal Server Error pattern detected in APIGateway",
      affectedServices: ["APIGateway"],
      relatedErrors: 50,
    },
  ];

  const rootCauses: RootCause[] = [
    {
      id: "rc-1",
      hypothesis: "Database connection pool exhaustion caused cascade failure",
      confidence: 92,
      evidence: [
        "ConnectionTimeoutException errors started at 14:32:00",
        "AuthService failures began 2 minutes after DB issues",
        "APIGateway 500s correlate with Auth failures",
        "All services recovered after DB connection pool was cleared",
      ],
      suggestedFix: "Increase connection pool size and implement circuit breaker pattern",
    },
    {
      id: "rc-2",
      hypothesis: "Missing retry logic in AuthService caused extended outage",
      confidence: 78,
      evidence: [
        "AuthService immediately failed on first DB timeout",
        "No exponential backoff observed in error patterns",
        "Session validation has no fallback mechanism",
      ],
      suggestedFix: "Implement retry with exponential backoff for database operations",
    },
  ];

  const errorsByService = [
    { service: "DatabaseService", count: 40 },
    { service: "AuthService", count: 50 },
    { service: "APIGateway", count: 50 },
    { service: "UserService", count: 5 },
  ];

  const errorsByTime = [
    { time: "14:00", errors: 2, warns: 5 },
    { time: "14:15", errors: 3, warns: 8 },
    { time: "14:30", errors: 45, warns: 15 },
    { time: "14:45", errors: 65, warns: 12 },
    { time: "15:00", errors: 55, warns: 8 },
    { time: "15:15", errors: 10, warns: 20 },
    { time: "15:30", errors: 2, warns: 5 },
  ];

  const topErrors = [
    {
      message: "ConnectionTimeoutException: Unable to establish connection to primary database",
      count: 40,
      firstSeen: new Date(baseTime.getTime() + 110 * 30000),
      lastSeen: new Date(baseTime.getTime() + 150 * 30000),
    },
    {
      message: "401 Unauthorized - Session validation failed due to database unavailability",
      count: 50,
      firstSeen: new Date(baseTime.getTime() + 150 * 30000),
      lastSeen: new Date(baseTime.getTime() + 200 * 30000),
    },
    {
      message: "500 Internal Server Error - Upstream service unavailable",
      count: 50,
      firstSeen: new Date(baseTime.getTime() + 200 * 30000),
      lastSeen: new Date(baseTime.getTime() + 250 * 30000),
    },
  ];

  return { entries, anomalies, rootCauses, errorsByService, errorsByTime, topErrors };
}

export default function LogAnalyzerPage() {
  const [analysis, setAnalysis] = useState<LogAnalysis | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAnalysis(generateSampleData());
    setIsAnalyzing(false);
  };

  const handleUpload = async () => {
    setShowUploader(false);
    await handleAnalyze();
  };

  return (
    <AppShell>
      <PageHeader
        title="Log Analyzer"
        description="Analyze log files for errors, anomalies, and root causes"
      >
        <div className="flex gap-2">
          {analysis && (
            <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
              Re-analyze
            </Button>
          )}
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Logs
          </Button>
        </div>
      </PageHeader>

      {showUploader && (
        <LogUploader
          onUpload={handleUpload}
          onClose={() => setShowUploader(false)}
        />
      )}

      {!analysis ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="rounded-full bg-secondary p-6 mb-6">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No logs analyzed yet
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Upload a log file or paste log text to detect anomalies, identify
            patterns, and get AI-powered root cause analysis
          </p>
          <Button onClick={() => setShowUploader(true)} size="lg">
            <Upload className="h-4 w-4 mr-2" />
            Upload Log File
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Log Viewer</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="root-causes">Root Causes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <LogStats analysis={analysis} />
            <div className="grid gap-6 lg:grid-cols-2">
              <ErrorChart data={analysis.errorsByTime} />
              <AnomalyTimeline anomalies={analysis.anomalies} compact />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <LogViewer entries={analysis.entries} />
          </TabsContent>

          <TabsContent value="anomalies">
            <AnomalyTimeline anomalies={analysis.anomalies} />
          </TabsContent>

          <TabsContent value="root-causes">
            <RootCausePanel rootCauses={analysis.rootCauses} />
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}
