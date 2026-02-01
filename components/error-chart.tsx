"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
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

interface ErrorChartProps {
  data: { time: string; errors: number; warns: number }[];
}

const chartConfig = {
  errors: {
    label: "Errors",
    color: "#ef4444",
  },
  warns: {
    label: "Warnings",
    color: "#f59e0b",
  },
};

export function ErrorChart({ data }: ErrorChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-card-foreground">Errors Over Time</CardTitle>
        <CardDescription>
          Distribution of errors and warnings during the analysis period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-muted-foreground text-xs">{value}</span>
              )}
            />
            <Bar
              dataKey="errors"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="Errors"
            />
            <Bar
              dataKey="warns"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              name="Warnings"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
