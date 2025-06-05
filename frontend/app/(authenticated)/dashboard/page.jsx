// app/(dashboard)/page.jsx
"use client";
import { StatsCard } from "@/components/dashboard/Cards/StatsCard";
// import { ActivityCard } from "@/components/dashboard/Cards/ActivityCard";
// import { EventsCard } from "@/components/dashboard/Cards/EventsCard";
// import { QuickActions } from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, John!</h1>
        <p className="text-slate-500">
          Your preparation journey is on track. Here's your progress overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Practice Tests"
          value="42"
          trend="↑ 12%"
          trendColor="text-green-500"
        />
        <StatsCard
          title="Average Score"
          value="87%"
          trend="↑ 5%"
          trendColor="text-green-500"
        />
        <StatsCard title="Mock Interviews" value="8" badge="3 Upcoming" />
        <StatsCard
          title="Coding Challenges"
          value="65"
          description="/ 100 Completed"
          progress={65}
        />
      </div>

      {/* Quick Actions */}
      {/* <QuickActions /> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* <ActivityCard /> */}
        {/* <EventsCard /> */}
      </div>
    </>
  );
}
