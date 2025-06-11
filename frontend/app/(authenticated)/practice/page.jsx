// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import axios from "axios";
import { toast } from "sonner";
import useAuthStore from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export default function PracticeTestsPage() {
  const { user, isAuthenticated, fetchUser} = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      if (!user) {
        try {
          await fetchUser();
        } catch (error) {
          router.replace("/auth/signin");
        }
      } else router.replace("/auth/signin");
    }
    if(!isAuthenticated) {
      checkUser();
    }
  }, []);

  const [filter, setFilter] = useState("all");
  const [subject, setSubject] = useState("all"); // Set initial value to 'all'
  const [test, setTests] = useState([]); // be cautious, it is test
  const [takenTestIds, setTakenTestIds] = useState([]);
  const [loadingTaken, setLoadingTaken] = useState(true);
  const [leaderboards, setLeaderboards] = useState({}); // {testId: [top5]}

  useEffect(() => {
    const fetchTaken = async () => {
      try {
        const res = await axios.get("http://localhost:5555/api/tests/taken", {
          withCredentials: true,
        });
        setTakenTestIds(res.data.takenTestIds || []);
      } catch (e) {
        setTakenTestIds([]);
      } finally {
        setLoadingTaken(false);
      }
    };
    fetchTaken();
  }, []);

  // Always define 'tests' before using it
  const tests = test.map((t) => ({
    id: t._id,
    name: t.name,
    subjects: t.subjects.map((s) => s.name),
    time: `${t.timeLimit} min`,
    questions: t.totalQuestions,
    completed: takenTestIds.includes(t._id), // Use backend data for 'taken'
    leaderboard: t.leaderboard || [],
  }));

  // Dynamically calculate allSubjects from current tests
  const allSubjects = useMemo(
    () => Array.from(new Set(tests.flatMap((t) => t.subjects))),
    [tests]
  );

  // Reset subject filter if current subject is not in allSubjects
  useEffect(() => {
    if (subject !== "all" && subject && !allSubjects.includes(subject)) {
      setSubject("all");
    }
  }, [allSubjects, subject]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get("http://localhost:5555/api/tests", {
          withCredentials: true,
        });
        setTests(response.data);
        // console.log("Fetched tests:", response.data);
        // toast.success([response.data]);
      } catch (error) {
        toast.error("Failed to fetch tests. Please try again later.");
        console.error("Error fetching tests:", error);
      }
    };
    fetchTests();
  }, []);

  // Fetch leaderboards for all visible tests
  useEffect(() => {
    async function fetchLeaderboards() {
      const ids = test.map((t) => t._id);
      const newLeaderboards = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await axios.get(
              `http://localhost:5555/api/tests/leaderboard/${id}`,
              { withCredentials: true }
            );
            newLeaderboards[id] = res.data || [];
          } catch {
            newLeaderboards[id] = [];
          }
        })
      );
      setLeaderboards(newLeaderboards);
    }
    if (test.length > 0) fetchLeaderboards();
  }, [test]);

  // Filtered tests based on tab and subject
  const filteredTests = useMemo(() => {
    return tests.filter((ts) => {
      if (filter === "taken" && !ts.completed) return false;
      if (filter === "not-taken" && ts.completed) return false;
      if (subject && subject !== "all" && !ts.subjects.includes(subject))
        return false;
      return true;
    });
  }, [filter, subject, tests, takenTestIds]); // Add takenTestIds as dependency

  if (loadingTaken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="animate-spin text-4xl text-blue-600 mb-4">⏳</span>
        <p className="text-lg text-muted-foreground">Loading your tests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Available Tests
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through your available tests and track your progress. Click
            on a test to begin or review your performance.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <Tabs
            value={filter}
            onValueChange={setFilter}
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="taken">Taken</TabsTrigger>
              <TabsTrigger value="not-taken">Not Taken</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="w-full md:w-64">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTests.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12">
              No tests found for the selected filter.
            </div>
          ) : (
            filteredTests.map((test) => (
              <Card
                key={test.id}
                className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {test.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {test.subjects.map((subject, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 whitespace-nowrap"
                      >
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-1">
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-2 text-gray-500"></i>
                      <span>{test.time}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-question-circle mr-2 text-gray-500"></i>
                      <span>{test.questions} Questions</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between items-center">
                  <div className="flex flex-col gap-2 w-full">
                    <Button
                      onClick={() =>
                        (window.location.href = "/player/" + test.id)
                      }
                      variant={test.completed ? "outline" : "default"}
                      className="!rounded-button whitespace-nowrap cursor-pointer"
                    >
                      {test.completed ? "Retake Test" : "Take Test"}
                    </Button>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="!rounded-button cursor-pointer"
                        tabIndex={0}
                        aria-label="Show leaderboard"
                      >
                        <i className="fas fa-trophy text-amber-500"></i>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4">
                      <h4 className="text-xs font-semibold mb-2">
                        Leaderboard
                      </h4>
                      <div className="mb-2 flex font-semibold text-[11px] text-blue-900 border-b pb-1">
                        <span className="w-6">#</span>
                        <span className="flex-1">User</span>
                        <span className="w-16 text-center">Score</span>
                        <span className="w-16 text-center">Time</span>
                      </div>
                      {Array.isArray(leaderboards[test.id]) &&
                      leaderboards[test.id].length > 0 ? (
                        <ol className="space-y-1">
                          {leaderboards[test.id]
                            .slice(0, 5)
                            .map((entry, idx) => {
                              const timeMin = Math.floor(
                                (entry.timeTaken || 0) / 60
                              );
                              const timeSec = (entry.timeTaken || 0) % 60;
                              return (
                                <li
                                  key={entry._id || idx}
                                  className={`flex items-center gap-2 rounded text-[11px] ${
                                    idx === 0
                                      ? "bg-yellow-50"
                                      : idx === 1
                                      ? "bg-gray-50"
                                      : idx === 2
                                      ? "bg-amber-50"
                                      : ""
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
                                    {entry.user_name ||
                                      entry.taken_by_user_email}
                                  </span>
                                  <span className="w-16 text-center">
                                    <Badge className="bg-green-100 text-green-800 text-[11px]">
                                      {entry.score} / {entry.totalQuestions}
                                    </Badge>
                                  </span>
                                  <span className="w-16 text-center text-[10px] text-gray-700">
                                    {timeMin}m {timeSec}s
                                  </span>
                                </li>
                              );
                            })}
                        </ol>
                      ) : (
                        <div className="text-gray-400 text-xs text-center">
                          No leaderboard data.
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
