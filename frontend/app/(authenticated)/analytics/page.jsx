// app/(dashboard)/analytics/page.jsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { PerformanceChart } from "@/components/ui/charts/PerformanceChart";
import { AccuracyChart } from "@/components/ui/charts/AccuracyChart";
import { TrendingUp, TrendingDown } from "lucide-react";
import useAuthStore from "@/lib/store/auth-store";

function getLast7Days() {
  const now = new Date();
  const last7 = new Date(now);
  last7.setDate(now.getDate() - 7);
  return last7;
}
function getPrev7Days() {
  const now = new Date();
  const prev7 = new Date(now);
  prev7.setDate(now.getDate() - 14);
  return prev7;
}

function calcStreak(submissions) {
  // Returns [currentStreak, bestStreak]
  if (!submissions.length) return [0, 0];
  const days = submissions
    .map((s) => new Date(s.taken_date_time).toDateString())
    .filter((v, i, arr) => arr.indexOf(v) === i) // unique days
    .sort((a, b) => new Date(b) - new Date(a));
  let streak = 1,
    best = 1;
  for (let i = 1; i < days.length; i++) {
    const d1 = new Date(days[i - 1]);
    const d2 = new Date(days[i]);
    if ((d1 - d2) / (1000 * 60 * 60 * 24) === 1) {
      streak++;
      if (streak > best) best = streak;
    } else {
      streak = 1;
    }
  }
  // If last submission is today, streak is current, else 0
  const today = new Date().toDateString();
  const lastDay = days[0];
  const currentStreak = lastDay === today ? streak : 0;
  return [currentStreak, best];
}

function calcTrend(current, prev) {
  if (prev === 0) return null;
  const diff = current - prev;
  const pct = Math.round((diff / prev) * 100);
  return pct;
}

function getSparkline(data, color = "#22c55e") {
  // Simple SVG sparkline, expects array of numbers
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((v - min) / range) * 16;
    return `${x},${y}`;
  });
  return (
    <svg width="64" height="24" viewBox="0 0 64 24">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}

// 3D SVG icon paths (place these SVGs in your public/ folder)
const ICONS = {
  tests: "/clipboard.png", // Download from IconScout
  accuracy: "/target.png", // Download from IconScout
  streak: "/fire.png", // Download from IconScout
  time: "/clock.png", // Download from IconScout
};

export default function AnalyticsPage() {
  const { user, fetchUser } = useAuthStore();

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    async function loadUser() {
      try {
        await fetchUser();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:5555/api/tests/user/analytics",
          {
            withCredentials: true,
          }
        );

        setSubmissions(res.data.submissions || []);
        setStats(res.data.stats || null);
      } catch (e) {
        setSubmissions([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // Helper functions
  function formatDate(dt) {
    return dt ? new Date(dt).toLocaleString() : "-";
  }
  function formatTime(secs) {
    if (!secs && secs !== 0) return "-";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  }

  // --- New analytics calculations ---
  const now = new Date();
  const last7 = getLast7Days();
  const prev7 = getPrev7Days();
  // Filter submissions by date
  const last7Subs = submissions.filter(
    (s) => new Date(s.taken_date_time) >= last7
  );
  const prev7Subs = submissions.filter(
    (s) =>
      new Date(s.taken_date_time) >= prev7 &&
      new Date(s.taken_date_time) < last7
  );
  // 1. Total Tests
  const totalTests = submissions.length;
  const last7Tests = last7Subs.length;
  const prev7Tests = prev7Subs.length;
  const testsTrend = calcTrend(last7Tests, prev7Tests);
  // 2. Average Accuracy
  const avgAcc = submissions.length
    ? Math.round(
        (submissions.reduce(
          (a, s) => a + s.correct / (s.totalQuestions || 1),
          0
        ) /
          submissions.length) *
          100
      )
    : 0;
  const last7Acc = last7Subs.length
    ? Math.round(
        (last7Subs.reduce(
          (a, s) => a + s.correct / (s.totalQuestions || 1),
          0
        ) /
          last7Subs.length) *
          100
      )
    : 0;
  const prev7Acc = prev7Subs.length
    ? Math.round(
        (prev7Subs.reduce(
          (a, s) => a + s.correct / (s.totalQuestions || 1),
          0
        ) /
          prev7Subs.length) *
          100
      )
    : 0;
  const accTrend = calcTrend(last7Acc, prev7Acc);
  // 3. Streak
  const [currentStreak, bestStreak] = calcStreak(submissions);
  // 4. Avg Time per Test
  const avgTime = submissions.length
    ? Math.round(
        submissions.reduce((a, s) => a + (s.timeTaken || 0), 0) /
          submissions.length
      )
    : 0;
  const last7Time = last7Subs.length
    ? Math.round(
        last7Subs.reduce((a, s) => a + (s.timeTaken || 0), 0) / last7Subs.length
      )
    : 0;
  const prev7Time = prev7Subs.length
    ? Math.round(
        prev7Subs.reduce((a, s) => a + (s.timeTaken || 0), 0) / prev7Subs.length
      )
    : 0;
  const timeTrend = calcTrend(prev7Time, last7Time); // For time, lower is better

  // Prepare sparklines
  const testsSpark = getSparkline(
    submissions
      .slice()
      .reverse()
      .map((s) => 1),
    "#2563eb"
  );
  const accSpark = getSparkline(
    submissions
      .slice()
      .reverse()
      .map((s) => Math.round((s.correct / (s.totalQuestions || 1)) * 100)),
    "#22c55e"
  );
  const streakSpark = getSparkline(
    (() => {
      // Build streak history (days with at least one submission)
      const days = {};
      submissions.forEach((s) => {
        const d = new Date(s.taken_date_time).toDateString();
        days[d] = (days[d] || 0) + 1;
      });
      return Object.values(days);
    })(),
    "#0ea5e9"
  );
  const timeSpark = getSparkline(
    submissions
      .slice()
      .reverse()
      .map((s) => s.timeTaken || 0),
    "#6366f1"
  );

  // Prepare chart data
  const trendData = (stats?.scoreTrend || [])
    .slice()
    .reverse() // oldest to newest for left-to-right chart
    .map((d) => ({
      ...d,
      dateLabel: d.date ? new Date(d.date).toLocaleDateString() : "-",
    }));

  // --- UI ---
  return (
    <div className="max-w-7xl mx-auto py-2">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {user?.name ? (
            <>
              Welcome,{" "}
              <span className="text-blue-700 font-extrabold">{user.name}</span>!
            </>
          ) : (
            "Analytics Dashboard"
          )}
        </h1>
        <p className="text-slate-500">
          Track your performance and identify areas for improvement.
        </p>
      </div>
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Tests Card */}
        <Card className="animate-float-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-blue-100 p-2 mr-2">
                <img src={ICONS.tests} alt="Total Tests" className="w-8 h-8" />
              </span>
              <CardTitle className="text-sm font-medium text-slate-500">
                Total Tests
              </CardTitle>
            </div>
            {testsSpark}
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{totalTests}</span>
              <span className="text-base text-slate-500">
                /{last7Tests} last 7d
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {typeof testsTrend === "number" && (
                <span
                  className={
                    testsTrend >= 0
                      ? "text-green-600 flex items-center"
                      : "text-red-600 flex items-center"
                  }
                >
                  {testsTrend >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {Math.abs(testsTrend)}% vs prev 7d
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Average Accuracy Card */}
        <Card className="animate-float-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-green-100 p-2 mr-2">
                <img src={ICONS.accuracy} alt="Accuracy" className="w-8 h-8" />
              </span>
              <CardTitle className="text-sm font-medium text-slate-500">
                Avg. Accuracy
              </CardTitle>
            </div>
            {accSpark}
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{avgAcc}%</span>
              <span className="text-base text-slate-500">
                /{last7Acc}% last 7d
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {typeof accTrend === "number" && (
                <span
                  className={
                    accTrend >= 0
                      ? "text-green-600 flex items-center"
                      : "text-red-600 flex items-center"
                  }
                >
                  {accTrend >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {Math.abs(accTrend)}% vs prev 7d
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Streak Card */}
        <Card className="animate-float-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-orange-100 p-2 mr-2">
                <img src={ICONS.streak} alt="Streak" className="w-8 h-8" />
              </span>
              <CardTitle className="text-sm font-medium text-slate-500">
                Streak
              </CardTitle>
            </div>
            {streakSpark}
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{currentStreak}d</span>
              <span className="text-base text-slate-500">
                /best {bestStreak}d
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className="text-blue-600">Keep your streak alive!</span>
            </div>
          </CardContent>
        </Card>
        {/* Avg Time per Test Card */}
        <Card className="animate-float-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-purple-100 p-2 mr-2">
                <img src={ICONS.time} alt="Time" className="w-8 h-8" />
              </span>
              <CardTitle className="text-sm font-medium text-slate-500">
                Avg. Time/Test
              </CardTitle>
            </div>
            {timeSpark}
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{formatTime(avgTime)}</span>
              <span className="text-base text-slate-500">
                /{formatTime(last7Time)} last 7d
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              {typeof timeTrend === "number" && (
                <span
                  className={
                    timeTrend < 0
                      ? "text-green-600 flex items-center"
                      : "text-red-600 flex items-center"
                  }
                >
                  {timeTrend < 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  {Math.abs(timeTrend)}% {timeTrend < 0 ? "faster" : "slower"}{" "}
                  vs prev 7d
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PerformanceChart
          data={trendData.map((d) => d.score)}
          labels={trendData.map((d) => d.dateLabel)}
        />
        <AccuracyChart data={trendData} />
      </div>
      {/* Recent Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Correct</TableHead>
                <TableHead>Incorrect</TableHead>
                <TableHead>Unattempted</TableHead>
                <TableHead>Time</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(showAll ? submissions : submissions.slice(0, 5)).map((sub) => (
                <TableRow key={sub._id}>
                  <TableCell>{sub.test_name}</TableCell>
                  <TableCell>{formatDate(sub.taken_date_time)}</TableCell>
                  <TableCell>
                    <Badge>
                      {sub.score} / {sub.totalQuestions}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      {sub.correct}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-red-100 text-red-800">
                      {sub.incorrect}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-gray-100 text-gray-800">
                      {sub.unattempted}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatTime(sub.timeTaken)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() =>
                        (window.location.href = `/player/${sub.test_id}/result/${sub._id}`)
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {submissions.length > 5 && !showAll && (
            <div className="flex justify-center mt-4">
              <Button onClick={() => setShowAll(true)}>Show More</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
