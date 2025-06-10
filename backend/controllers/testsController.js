import asyncHandler from "express-async-handler";
import Test from "../models/Test.js";
import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import Question from "../models/Question.js";
import TestResult from "../models/TestResult.js";
import UserTest from "../models/UserTest.js";

// @desc   Fetch tests
// @route  GET /api/tests
// @access Public
const fetchTests = asyncHandler(async (req, res) => {
  // Fetch tests with selected fields
  const tests = await Test.find(
    {},
    {
      totalQuestions: 1,
      timeLimit: 1,
      subjects: 1,
      name: 1,
    }
  ).sort({ createdAt: -1 });

  // Extract all unique subject IDs from all tests
  const subjectIds = [...new Set(tests.flatMap((test) => test.subjects))];

  // Fetch subject names for these IDs
  const subjects = await Subject.find(
    { _id: { $in: subjectIds } },
    { name: 1 }
  );

  // Create a map for quick lookup: { _id => name }
  const subjectMap = {};
  subjects.forEach((subject) => {
    subjectMap[subject._id] = subject.name;
  });

  // Replace subject IDs with names in each test
  const testsWithSubjectNames = tests.map((test) => ({
    ...test.toObject(),
    subjects: test.subjects.map((id) => ({
      _id: id,
      name: subjectMap[id] || "Unknown Subject",
    })),
  }));

  res.status(200).json(testsWithSubjectNames);
});

// @desc    Fetch a test by ID
// @route   POST /api/tests/:id
// @access  Private
const fetchTest = asyncHandler(async (req, res) => {
  const testId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Test not found!!!" });
  }
  const testData = await Test.findById(testId, {
    totalQuestions: 1,
    timeLimit: 1,
    subjects: 1,
    name: 1,
    questions: 1,
    questionIds: 1,
  });
  const subjectIds = testData.subjects;
  const subjects = await Subject.find(
    { _id: { $in: subjectIds } },
    { name: 1 }
  );
  // Create a map for quick lookup: { _id => name }
  const subjectMap = {};
  subjects.forEach((subject) => {
    subjectMap[subject._id] = subject.name;
  });

  // Replace subject IDs with names in the single test
  const testWithSubjectNames = {
    ...testData.toObject(),
    subjects: testData.subjects.map((id) => ({
      _id: id,
      name: subjectMap[id] || "Unknown Subject",
    })),
  };

  res.status(200).json(testWithSubjectNames);
});

// @desc    fetchQuestions for the test
// @route   POST /api/tests/questions
// @access  Private
const fetchQuestions = asyncHandler(async (req, res) => {
  const { questionIds } = req.body;
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    return res
      .status(400)
      .json({ message: "No questions found for the test." });
  }
  const questions = await Question.aggregate([
    {
      $match: {
        _id: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $project: {
        text: 1,
        options: 1,
      },
    },
  ]);
  if (questions.length === 0) {
    return res
      .status(404)
      .json({ message: "No questions found for the provided IDs." });
  }
  res.status(200).json(questions);
});

const submitTest = asyncHandler(async (req, res) => {
  const { testId, questionIds, answers, timeTaken } = req.body;
  const user = req.user; // assuming protect middleware sets req.user
  const test = await Test.findById(testId);
  const correctAnswers = await Question.find(
    { _id: { $in: questionIds.map((id) => new mongoose.Types.ObjectId(id)) } },
    { correct: 1 }
  );

  let score = 0;
  for (let i = 0; i < questionIds.length; i++) {
    const questionId = questionIds[i];
    const answer = answers[i];
    const correctAnswer = correctAnswers.find(
      (q) => q._id.toString() === questionId.toString()
    );
    if (correctAnswer && correctAnswer.correct === answer) {
      score++;
    }
  }
  const percentage =
    test && test.totalQuestions ? (score / test.totalQuestions) * 100 : null;
  // Save result
  const testResult = await TestResult.create({
    test_id: testId,
    test_name: test?.name,
    taken_by_user_id: user?._id,
    taken_by_user_email: user?.email,
    user_name: user?.name,
    score,
    totalQuestions: test?.totalQuestions,
    percentage,
    timeTaken,
    taken_date_time: new Date(),
    answers: questionIds.map((qid, idx) => ({
      questionId: qid,
      answerIndex: answers[idx],
    })),
    questionIds,
    completed: true,
    device_info: req.headers["user-agent"],
    ip_address: req.ip,
  });
  // Save UserTest link
  await UserTest.create({
    user_id: user?._id,
    test_result_id: testResult._id,
    test_id: testId, // store testId for quick lookup
  });
  return res.status(200).json({ testResultId: testResult._id });
});

// @desc    Fetch a test result by resultId, including correct answer and explanation for each question
// @route   GET /api/tests/result/:id
// @access  Private
const fetchTestResultById = asyncHandler(async (req, res) => {
  const { testResultId } = req.body;

  const resultId = testResultId;
  console.log("Fetching test result for ID:", resultId);
  if (!mongoose.Types.ObjectId.isValid(resultId)) {
    return res.status(400).json({ message: "Invalid result id" });
  }
  // Fetch the test result
  const testResult = await TestResult.findById(resultId);
  if (!testResult) {
    return res.status(404).json({ message: "Test result not found" });
  }
  // Fetch all questions with correct answer and explanation
  const questions = await Question.find(
    { _id: { $in: testResult.questionIds } },
    {
      text: 1,
      options: 1,
      correct: 1,
      explanation: 1,
      topics: 1,
      questionType: 1,
    }
  );
  // Map questionId to question details
  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });
  // Attach question details to each answer
  const answersWithDetails = testResult.answers.map((ans) => {
    const q = questionMap[ans.questionId.toString()];
    return {
      questionId: ans.questionId,
      answerIndex: ans.answerIndex,
      question: q
        ? {
            text: q.text,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation || null,
            topics: q.topics || [],
            questionType: q.questionType || "MCQ",
          }
        : null,
    };
  });
  res.status(200).json({
    ...testResult.toObject(),
    answers: answersWithDetails,
  });
});

// @desc    Leaderboard for a test (top 5 results)
// @route   GET /api/tests/leaderboard/:testId
// @access  Private
const fetchLeaderboardForTest = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Invalid test id" });
  }
  const results = await TestResult.find({ test_id: testId })
    .sort({ score: -1, timeTaken: 1 })
    .limit(5)
    .select("user_name taken_by_user_email score totalQuestions timeTaken");
  res.status(200).json(results);
});

// @desc    Get all testIds taken by the current user
// @route   GET /api/tests/taken
// @access  Private
const fetchTakenTestIds = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const userTests = await UserTest.find({ user_id: userId }).select("test_id");
  const takenTestIds = userTests.map((ut) => ut.test_id.toString());
  res.status(200).json({ takenTestIds });
});

// @desc    User analytics: all submissions, stats, and trends
// @route   GET /api/user/analytics
// @access  Private
const fetchUserAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Get all UserTest entries for this user, most recent first
  const userTests = await UserTest.find({ user_id: userId })
    .sort({ added_at: -1 })
    .populate({
      path: "test_result_id",
      model: "TestResult",
    });

  // Prepare submissions array
  const submissions = [];
  let totalScore = 0,
    totalQuestions = 0,
    totalTime = 0,
    bestScore = 0,
    correctSum = 0,
    incorrectSum = 0,
    unattemptedSum = 0;
  const scoreTrend = [];

  for (const ut of userTests) {
    const tr = ut.test_result_id;
    if (!tr) continue;
    // Fetch all questions for this test result to get correct answers
    let correct = 0,
      incorrect = 0,
      unattempted = 0;
    let questionCorrectMap = {};
    if (Array.isArray(tr.questionIds) && tr.questionIds.length > 0) {
      const questions = await Question.find(
        { _id: { $in: tr.questionIds } },
        { _id: 1, correct: 1 }
      );
      questions.forEach((q) => {
        questionCorrectMap[q._id.toString()] = q.correct;
      });
    }
    if (Array.isArray(tr.answers) && Array.isArray(tr.questionIds)) {
      for (let i = 0; i < tr.answers.length; i++) {
        const ans = tr.answers[i];
        const qid = ans.questionId
          ? ans.questionId.toString()
          : tr.questionIds[i]
          ? tr.questionIds[i].toString()
          : null;
        const correctIndex = qid ? questionCorrectMap[qid] : undefined;
        if (ans.answerIndex === -1 || ans.answerIndex === undefined) {
          unattempted++;
        } else if (
          correctIndex !== undefined &&
          ans.answerIndex === correctIndex
        ) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }
    submissions.push({
      _id: tr._id,
      test_id: tr.test_id,
      test_name: tr.test_name,
      score: tr.score,
      totalQuestions: tr.totalQuestions,
      percentage: tr.percentage,
      timeTaken: tr.timeTaken,
      taken_date_time: tr.taken_date_time,
      correct,
      incorrect,
      unattempted,
    });
    totalScore += tr.score;
    totalQuestions += tr.totalQuestions || 0;
    totalTime += tr.timeTaken || 0;
    if (tr.percentage > bestScore) bestScore = tr.percentage;
    correctSum += correct;
    incorrectSum += incorrect;
    unattemptedSum += unattempted;
    scoreTrend.push({
      date: tr.taken_date_time,
      score: tr.score,
      percentage: tr.percentage,
      accuracy: tr.totalQuestions ? (correct / tr.totalQuestions) * 100 : 0,
    });
  }

  const totalTests = submissions.length;
  const avgScore = totalTests
    ? Math.round((totalScore / totalQuestions) * 100)
    : 0;
  const avgTime = totalTests ? Math.round(totalTime / totalTests) : 0;

  res.status(200).json({
    stats: {
      totalTests,
      avgScore,
      bestScore: Math.round(bestScore),
      avgTime,
      correct: correctSum,
      incorrect: incorrectSum,
      unattempted: unattemptedSum,
      scoreTrend,
    },
    submissions,
  });
});

export {
  fetchTests,
  fetchTest,
  fetchQuestions,
  submitTest,
  fetchTestResultById,
  fetchLeaderboardForTest,
  fetchTakenTestIds,
  fetchUserAnalytics,
};
