"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { config } from "@/lib/config";
ChartJS.register(ArcElement, Tooltip, Legend);

// Dynamically import chart to avoid SSR issues
const PerformanceChart = dynamic(
  () =>
    import("@/components/ui/charts/PerformanceChart").then(
      (mod) => mod.PerformanceChart
    ),
  { ssr: false }
);

export default function TestResultPage({ params }) {
  const { testResultId } = React.use(params);
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [testMeta, setTestMeta] = useState(null);

  useEffect(() => {
    async function fetchResult() {
      setLoading(true);
      setError("");
      try {
        const response = await axios.post(
          `${config.apiUrl}/api/tests/result`,
          { testResultId },
          { withCredentials: true }
        );
        if (!response.data) throw new Error("No result found");
        setResult(response.data);
        // Fetch leaderboard and test meta
        fetchLeaderboardAndMeta(response.data.test_id);
      } catch (err) {
        setError(err.message || "Something went wrong");
        toast.error("Could not load result", { description: err.message });
      } finally {
        setLoading(false);
      }
    }
    async function fetchLeaderboardAndMeta(testId) {
      try {
        // Leaderboard: top 5 scores for this test
        const lbRes = await axios.get(
          `${config.apiUrl}/api/tests/leaderboard/${testId}`,
          { withCredentials: true }
        );
        setLeaderboard(lbRes.data || []);
        // Test meta: name, subjects
        const metaRes = await axios.post(
          `${config.apiUrl}/api/tests/${testId}`,
          {},
          { withCredentials: true }
        );
        setTestMeta(metaRes.data || null);
      } catch (e) {
        // ignore leaderboard/meta errors
      }
    }
    if (testResultId) fetchResult();
  }, [testResultId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="animate-spin text-4xl text-blue-600 mb-4">⏳</span>
        <p className="text-lg text-muted-foreground">Loading your result...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="text-4xl text-red-500 mb-4">❌</span>
        <p className="text-lg text-destructive">{error}</p>
        <Button className="mt-4" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  if (!result) return null;

  // Stats
  const {
    score,
    totalQuestions,
    percentage,
    timeTaken,
    taken_date_time,
    answers,
    test_name,
    test_id,
  } = result;

  // Get current user email from result
  const currentUserEmail = result.taken_by_user_email;
  const currentUserName = result.user_name;

  // Prepare leaderboard rows (top 5 + user best if not in top 5)
  let userInTop5 = false;
  let userBest = null;
  let leaderboardRows = leaderboard.slice(0, 5).map((entry, idx) => {
    const isCurrent = entry.taken_by_user_email === currentUserEmail;
    if (isCurrent) {
      userInTop5 = true;
      userBest = entry;
    }
    return { ...entry, idx, isCurrent };
  });
  // If not in top 5, find user's best score and add as 6th row
  if (!userInTop5 && leaderboard.length > 0) {
    const allUserResults = leaderboard.filter(
      (e) => e.taken_by_user_email === currentUserEmail
    );
    if (allUserResults.length > 0) {
      userBest = allUserResults.reduce((best, curr) => {
        if (!best) return curr;
        if (curr.score > best.score) return curr;
        if (curr.score === best.score && curr.timeTaken < best.timeTaken)
          return curr;
        return best;
      }, null);
      leaderboardRows.push({ ...userBest, idx: 5, isCurrent: true });
    }
  }

  // Categorize answers
  let correct = 0,
    incorrect = 0,
    notAttempted = 0;
  answers.forEach((a) => {
    if (a.answerIndex === -1 || a.answerIndex === undefined) {
      notAttempted++;
    } else if (a.question && a.answerIndex === a.question.correct) {
      correct++;
    } else {
      incorrect++;
    }
  });

  const attempted = correct + incorrect;
  const overallAccuracy =
    totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
  const attemptAccuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  const timeMin = Math.floor((timeTaken || 0) / 60);
  const timeSec = (timeTaken || 0) % 60;

  // Chart.js doughnut data
  const doughnutData = {
    labels: ["Correct", "Incorrect", "Not Attempted"],
    datasets: [
      {
        data: [correct, incorrect, notAttempted],
        backgroundColor: ["#22c55e", "#ef4444", "#a3a3a3"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // Minimalistic layout with right sidebar
  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-10 px-2 md:px-0">
      <div className="flex-1">
        <Card className="shadow-xl border-blue-100">
          <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
            <CardTitle className="text-2xl md:text-3xl font-bold text-blue-900 text-center">
              {testMeta?.name || test_name || "Test Result"}
            </CardTitle>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              <Badge className="bg-green-100 text-green-800">
                Score: {correct} / {totalQuestions}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {overallAccuracy.toFixed(1)}% Overall Accuracy
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800">
                Time: {timeMin}m {timeSec}s
              </Badge>
              <Badge className="bg-gray-100 text-gray-800">
                {new Date(taken_date_time).toLocaleString()}
              </Badge>
            </div>
            {testMeta?.subjects && (
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {testMeta.subjects.map((subj) => (
                  <Badge
                    key={subj._id}
                    className="bg-indigo-100 text-indigo-800"
                  >
                    {subj.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="py-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1 flex flex-col gap-4 items-center">
                <div className="w-full max-w-xs mx-auto">
                  <Doughnut
                    data={doughnutData}
                    options={{
                      cutout: "70%",
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const label = context.label || "";
                              const value = context.raw;
                              return `${label}: ${value}`;
                            },
                          },
                        },
                      },
                      animation: { animateRotate: true, duration: 900 },
                    }}
                  />
                  <div className="flex justify-between text-xs mt-2 text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-green-700">
                      {correct}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Correct
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-red-600">
                      {incorrect}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Incorrect
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-gray-500">
                      {notAttempted}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Not Attempted
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2 mt-4 w-full justify-center">
                  <Badge className="bg-blue-50 text-blue-800 border border-blue-200">
                    Attempted: {attempted} / {totalQuestions}
                  </Badge>
                  <Badge className="bg-green-50 text-green-800 border border-green-200">
                    Attempt Accuracy: {attemptAccuracy.toFixed(1)}%
                  </Badge>
                  <Badge className="bg-gray-50 text-gray-800 border border-gray-200">
                    Not Attempted: {notAttempted}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col items-center gap-4">
              <Button
                variant={showReview ? "secondary" : "default"}
                className="rounded-full px-6 py-2 text-base shadow-md"
                onClick={() => setShowReview((v) => !v)}
              >
                {showReview
                  ? "Hide Question Review"
                  : "Show Questions & Explanations"}
              </Button>
            </div>
            {showReview && (
              <div className="mt-6 space-y-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Question Review
                </h3>
                <div className="space-y-4">
                  {answers.map((ans, idx) => {
                    const q = ans.question;
                    if (!q) return null;
                    const isCorrect = ans.answerIndex === q.correct;
                    return (
                      <Card
                        key={ans.questionId}
                        className={`border-2 ${
                          isCorrect
                            ? "border-green-200"
                            : ans.answerIndex == null
                            ? "border-gray-200"
                            : "border-red-200"
                        } bg-white/80 shadow-sm`}
                      >
                        <CardHeader className="flex flex-row items-center gap-2">
                          <span className="font-bold text-lg text-blue-800">
                            Q{idx + 1}.
                          </span>
                          <span className="text-base text-blue-900">
                            {q.text}
                          </span>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-col gap-1">
                            {q.options.map((opt, i) => (
                              <div
                                key={i}
                                className={`px-3 py-2 rounded-md border flex items-center gap-2 text-sm
                                  ${
                                    i === q.correct
                                      ? "border-green-400 bg-green-50 font-semibold"
                                      : "border-gray-200"
                                  }
                                  ${
                                    i === ans.answerIndex && i !== q.correct
                                      ? "border-red-400 bg-red-50"
                                      : ""
                                  }
                                `}
                              >
                                <span className="font-mono">
                                  {String.fromCharCode(65 + i)}.
                                </span>{" "}
                                {opt}
                                {i === q.correct && (
                                  <Badge className="ml-2 bg-green-200 text-green-800">
                                    Correct
                                  </Badge>
                                )}
                                {i === ans.answerIndex && i !== q.correct && (
                                  <Badge className="ml-2 bg-red-200 text-red-800">
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <div className="mt-2 p-3 rounded bg-blue-50 border-l-4 border-blue-400 text-blue-900 text-sm">
                              <span className="font-semibold">
                                Explanation:
                              </span>{" "}
                              {q.explanation}
                            </div>
                          )}
                          {!q.explanation && (
                            <div className="mt-2 text-xs text-gray-400 italic">
                              No explanation available.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Right Sidebar: Leaderboard & Test Info */}
      <div className="w-full md:w-80 flex-shrink-0 mt-10 md:mt-0 md:ml-4">
        <Card className="shadow border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-900">
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <div className="flex font-semibold text-sm text-blue-900 border-b pb-1">
                <span className="w-6">#</span>
                <span className="flex-1">User</span>
                <span className="w-20 text-center">Score</span>
                <span className="w-20 text-center">Time</span>
              </div>
            </div>
            {leaderboardRows.length === 0 ? (
              <div className="text-gray-400 text-sm">No leaderboard data.</div>
            ) : (
              <ol className="space-y-1">
                {leaderboardRows.map((entry, idx) => {
                  const isCurrent = entry.isCurrent;
                  const timeMin = Math.floor((entry.timeTaken || 0) / 60);
                  const timeSec = (entry.timeTaken || 0) % 60;
                  return (
                    <li
                      key={entry._id || idx}
                      className={`flex items-center gap-2 rounded ${
                        isCurrent ? "bg-blue-50" : ""
                      } px-1 py-1`}
                    >
                      <span
                        className={`font-bold w-6 text-center ${
                          idx === 0
                            ? "text-yellow-500"
                            : idx === 1
                            ? "text-gray-500"
                            : idx === 2
                            ? "text-amber-700"
                            : "text-blue-800"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 truncate flex items-center gap-1">
                        {isCurrent && (
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-1">
                            👤
                          </span>
                        )}
                        {isCurrent
                          ? `You${
                              currentUserName ? ` (${currentUserName})` : ""
                            }`
                          : entry.user_name || entry.taken_by_user_email}
                      </span>
                      <span className="w-20 text-center">
                        <Badge className="bg-green-100 text-green-800">
                          {entry.score} / {entry.totalQuestions}
                        </Badge>
                      </span>
                      <span className="w-20 text-center text-xs text-gray-700">
                        {timeMin}m {timeSec}s
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
