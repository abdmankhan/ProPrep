    // app/(dashboard)/analytics/page.jsx
"use client";
import { useEffect } from "react";
import * as echarts from "echarts";
import { PerformanceChart } from "@/components/ui/charts/PerformanceChart";
// import { TopicMasteryChart } from "@/components/ui/charts/TopicMasteryChart";
// import { TimeDistributionChart } from "@/components/ui/charts/TimeDistributionChart";
// import { SkillsAssessment } from "@/components/dashboard/SkillsAssessment";

export default function AnalyticsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-slate-500">
          Track your performance and identify areas for improvement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PerformanceChart />
        {/* <TopicMasteryChart /> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* <TimeDistributionChart /> */}
        {/* <SkillsAssessment /> */}
      </div>
    </>
  );
}