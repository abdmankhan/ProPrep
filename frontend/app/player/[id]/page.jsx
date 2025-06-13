"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import axios from "axios";
import { set } from "date-fns";
import { useRouter } from "next/navigation";
import { config } from "@/lib/config";

export default function QuestionPlayerPage({ params }) {
  // Get test id from params
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);
  const [testData, setTestData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]); // [{questionId, answerIndex}]
  const [timeLeft, setTimeLeft] = useState(null); // in seconds
  const timerRef = useRef();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const fetchTest = async () => {
      const response = await axios.post(
        `${config.apiUrl}/api/tests/${id}`,
        {},
        { withCredentials: true }
      );
      setTestData(response.data);
      setLoading(false);
    };
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (!testData) return;
    const fetchQuestions = async () => {
      const response = await axios.post(
        `${config.apiUrl}/api/tests/questions`,
        { questionIds: testData?.questionIds || [] },
        { withCredentials: true }
      );
      setQuestions(response.data);
      // Initialize responses to -1 for each question
      setResponses(
        (response.data || []).map((q) => ({
          questionId: q._id,
          answerIndex: -1,
        }))
      );
      // Set timer
      setTimeLeft((testData.timeLimit || 10) * 60);
    };
    fetchQuestions();
  }, [testData]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit(); // Direct submit, no confirmation
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // Format timer
  function formatTime(secs) {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `00:${m}:${s}`;
  }

  // Option click handler
  const handleOptionClick = (idx) => {
    setResponses((prev) =>
      prev.map((r, i) =>
        i === currentQuestion ? { ...r, answerIndex: idx } : r
      )
    );
  };

  // Clear response
  const handleClear = () => {
    setResponses((prev) =>
      prev.map((r, i) =>
        i === currentQuestion ? { ...r, answerIndex: -1 } : r
      )
    );
  };

  // Navigation
  const goToQuestion = (idx) => setCurrentQuestion(idx);
  const handlePrev = () => setCurrentQuestion((q) => Math.max(0, q - 1));
  const handleNext = () =>
    setCurrentQuestion((q) => Math.min((questions?.length || 1) - 1, q + 1));

  // Submit
  const handleSubmit = async () => {
    if (!testData || !questions.length) return;
    const timeTaken = testData.timeLimit * 60 - timeLeft;
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/tests/submit/${testData._id}`,
        {
          testId: testData._id,
          questionIds: questions.map((q) => q._id),
          answers: responses.map((r) => r.answerIndex),
          timeTaken,
        },
        { withCredentials: true }
      );
      const { testResultId } = response.data;
      toast.success("Test submitted successfully!");
      // redirect to result page with the resultId
      router.push(`${id}/result/${testResultId}`);
    } catch (e) {
      toast.error("Submission failed");
    }
  };

  // Handler for user-initiated submit (with confirmation)
  const [showConfirm, setShowConfirm] = useState(false);
  const handleUserSubmit = () => setShowConfirm(true);
  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    handleSubmit();
  };
  const handleCancelSubmit = () => setShowConfirm(false);

  // Loader UI
  if (
    loading ||
    !testData ||
    !questions.length ||
    responses.length !== questions.length
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#143db7]"></div>
          <div className="text-lg font-semibold text-[#143db7]">
            Loading your test...
          </div>
        </div>
      </div>
    );
  }

  // Current question data
  const q = questions[currentQuestion];
  const selectedOption = responses[currentQuestion]?.answerIndex;
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const subject = testData.subjects?.[0]?.name || "";
  const timeRemaining = formatTime(timeLeft);

  return (
    <div
      className="relative flex min-h-screen flex-col bg-white overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className="flex h-full grow flex-col">
        <header className="flex items-center justify-between border-b border-[#f0f1f4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#111318]">
            <div className="size-4">
              {/* Logo SVG */}
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6_330)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_330">
                    <rect width="48" height="48" fill="white"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              Exam Prep
            </h2>
          </div>
        </header>
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[920px] flex-1">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-6 justify-between">
                <p className="text-base font-medium">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
              <div className="rounded bg-[#dcdee5]">
                <div
                  className="h-2 rounded bg-[#111318]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            {/* Time/Subject cards */}
            <div
              className="flex flex-wrap gap-4 p-4 pt-0"
              style={{ minHeight: 0 }}
            >
              <div
                className="flex w-full gap-4 justify-center items-center"
                style={{ height: "90px" }}
              >
                <Card
                  className="flex-1 flex flex-col gap-1 p-4 bg-[#f0f1f4] min-w-[158px] max-w-[320px] justify-center items-center"
                  style={{ height: "100%" }}
                >
                  <p className="text-lg font-semibold">Time Remaining</p>
                  <p className="text-2xl text-blue-500 font-extrabold tracking-tight">
                    {timeRemaining}
                  </p>
                </Card>
                <Card
                  className="flex-1 flex flex-col gap-1 p-4 bg-[#f0f1f4] min-w-[158px] max-w-[320px] justify-center items-center"
                  style={{ height: "100%" }}
                >
                  <p className="text-lg font-semibold">Subject</p>
                  <p className="text-1xl text-blue-500 font-extrabold tracking-tight">
                    {testData.subjects.map((s) => s.name).join(", ")}
                  </p>
                </Card>
              </div>
            </div>
            {/* Question and options area */}
            <h1 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-3 pt-5">
              {q.text}
            </h1>
            <div className="flex flex-col gap-3 p-4">
              {q.options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 rounded-xl border border-[#dcdee5] p-[15px] cursor-pointer ${
                    selectedOption === idx ? "bg-blue-100 border-blue-500" : ""
                  }`}
                  onClick={() => handleOptionClick(idx)}
                >
                  <input
                    type="radio"
                    className="h-5 w-5 border-2 border-[#dcdee5] bg-transparent text-transparent checked:border-[#111318] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#111318]"
                    name={`question-option-${q._id}`}
                    checked={selectedOption === idx}
                    readOnly
                  />
                  <div className="flex grow flex-col">
                    <p className="text-sm font-medium">{opt}</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="mt-2 w-fit self-end"
                onClick={handleClear}
              >
                Clear Response
              </Button>
            </div>
            <div className="flex justify-stretch">
              <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-between">
                <Button
                  variant="secondary"
                  className="min-w-[84px] max-w-[480px] h-10"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button
                  className="min-w-[84px] max-w-[480px] h-10"
                  onClick={handleNext}
                  disabled={currentQuestion === totalQuestions - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          {/* Right side: Questions grid and submit */}
          <div className="flex flex-col w-[180px] relative select-none">
            <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Questions
            </h2>
            <div
              className="rounded-md bg-[#f8f9fb] px-2 py-2"
              style={{
                height: "220px",
                minHeight: "120px",
                maxHeight: "220px",
                display: "grid",
                gridTemplateColumns: `repeat(auto-fit, minmax(38px, 1fr))`,
                gap: "8px",
                overflowY: "auto",
                justifyItems: "center",
                alignItems: "center",
              }}
            >
              {questions.map((ques, idx) => (
                <Card
                  key={ques._id}
                  className={`flex flex-col items-center justify-center gap-1 rounded-lg border bg-white p-0 cursor-pointer text-xs font-bold transition-all duration-150 select-none
                    ${
                      responses[idx]?.answerIndex !== -1
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }
                    ${currentQuestion === idx ? "ring-2 ring-blue-400" : ""}`}
                  style={{
                    minHeight: 32,
                    minWidth: 32,
                    maxWidth: 38,
                    height: 38,
                    width: 38,
                    padding: 0,
                    margin: 0,
                  }}
                  onClick={() => goToQuestion(idx)}
                >
                  <span>{idx + 1}</span>
                </Card>
              ))}
            </div>
            {/* Submit button fixed to bottom right with margin */}
            <div className="absolute right-4 bottom-4 w-[calc(100%-2rem)]">
              <Button
                className="w-full bg-gradient-to-r from-[#fa1515] to-[#facc15] text-white font-bold shadow-lg rounded-lg py-2 text-base transition-all duration-150 hover:from-[#c1121f] hover:to-[#facc15] hover:scale-[1.03]"
                onClick={handleUserSubmit}
                aria-label="Submit Test"
                type="button"
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
                    />
                  </svg>
                  Submit Test
                </span>
              </Button>
            </div>
            {/* Confirmation Modal */}
            {showConfirm && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-xl p-6 min-w-[320px] max-w-[90vw] flex flex-col items-center">
                  <div className="text-lg font-bold mb-2">Submit Test?</div>
                  <div className="mb-4 text-sm text-gray-700 text-center">
                    Are you sure you want to submit? You cannot change your
                    answers after submission.
                  </div>
                  <div className="flex gap-2 justify-center">
                    <button
                      className="bg-[#fa1515] text-white rounded px-4 py-1 text-sm font-semibold hover:bg-[#c1121f]"
                      onClick={handleConfirmSubmit}
                    >
                      Yes, Submit
                    </button>
                    <button
                      className="border border-gray-300 rounded px-4 py-1 text-sm font-semibold hover:bg-gray-100"
                      onClick={handleCancelSubmit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// For Next.js 13+ app directory, use export const dynamic = 'force-dynamic' if needed.
// This file should be placed at app/player/[id]/page.jsx
