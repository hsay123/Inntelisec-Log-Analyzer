"use client";

import { useEffect } from "react"

import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const activityData = [
  { date: "Mon", queries: 12, errors: 3 },
  { date: "Tue", queries: 18, errors: 5 },
  { date: "Wed", queries: 24, errors: 2 },
  { date: "Thu", queries: 32, errors: 8 },
  { date: "Fri", queries: 28, errors: 4 },
  { date: "Sat", queries: 15, errors: 1 },
  { date: "Sun", queries: 20, errors: 3 },
];

const chartConfig = {
  queries: {
    label: "Queries",
    color: "#06b6d4",
  },
  errors: {
    label: "Errors Detected",
    color: "#ef4444",
  },
};

export function ActivityChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Weekly Activity</CardTitle>
        <CardDescription>
          Document queries and detected errors over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={activityData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="queries"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorQueries)"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorErrors)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
