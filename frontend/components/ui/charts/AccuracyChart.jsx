// components/ui/charts/AccuracyChart.jsx
"use client";
import { useEffect } from "react";
import * as echarts from "echarts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function AccuracyChart({ data = [] }) {
  useEffect(() => {
    const chart = echarts.init(document.getElementById("accuracy-chart"));
    const option = {
      animation: false,
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data:
          data.length > 0
            ? data.map((d) => d.dateLabel)
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { formatter: "{value}%" },
      },
      series: [
        {
          name: "Accuracy",
          type: "line",
          data:
            data.length > 0
              ? data.map((d) => Math.round(d.accuracy ?? 0))
              : [80, 85, 90, 88, 92, 95, 93],
          smooth: true,
          lineStyle: { width: 3, color: "#22c55e" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(34, 197, 94, 0.3)" },
                { offset: 1, color: "rgba(34, 197, 94, 0.05)" },
              ],
            },
          },
        },
      ],
    };
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy Trend</CardTitle>
        <CardDescription>Your accuracy (%) over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div id="accuracy-chart" className="h-[300px]"></div>
      </CardContent>
    </Card>
  );
}
