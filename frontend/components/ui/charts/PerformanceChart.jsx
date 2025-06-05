// components/ui/charts/PerformanceChart.jsx
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

export function PerformanceChart() {
  useEffect(() => {
    const chart = echarts.init(document.getElementById("performance-chart"));
    const option = {
      animation: false,
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: { type: "value" },
      series: [
        {
          name: "Score",
          type: "line",
          data: [82, 93, 90, 94, 85, 92, 88],
          smooth: true,
          lineStyle: { width: 3, color: "#2563eb" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(37, 99, 235, 0.3)" },
                { offset: 1, color: "rgba(37, 99, 235, 0.05)" },
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
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
        <CardDescription>Your test scores over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <div id="performance-chart" className="h-[300px]"></div>
      </CardContent>
    </Card>
  );
}
