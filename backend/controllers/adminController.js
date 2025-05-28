import asyncHandler from "express-async-handler";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import { callGemini } from "../utils/gemini.js"

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().sort("name");
  res.json(subjects);
});

// @desc    Add a new topic
// @route   POST /api/admin/topics
// @access  Private
const addTopic = asyncHandler(async (req, res) => {
  const { subjectId, name, subjectName } = req.body;
  const topic = await Topic.create({
    subject: subjectId,
    name,
    subjectName,
  });
  res.status(201).json(topic);
});

// @desc    Get all topics for a subject
// @route   GET /api/admin/topics
// @access  Private
const getTopics = asyncHandler(async (req, res) => {
  const { subjectId } = req.query;
  const topics = await Topic.find({ subject: subjectId }).sort("name");
  res.json(topics);
});

// @desc    Generate questions using Gemini AI
// @route   POST /api/admin/generate-questions
// @access  Private

const generateQuestions = asyncHandler(async (req, res) => {
  const { subjectId, topicIds, lod, count } = req.body;
  // Build prompt for Gemini
  const subject = await Subject.findById(subjectId);
  const topics = await Topic.find({ _id: { $in: topicIds } });
  const prompt = `Generate ${count} MCQs (question, 4 options, indicate correct index) on ${
    subject.name
  }, topics: ${topics.map((t) => t.name).join(", ")}, difficulty ${
    ["easy", "medium", "hard", "mixed"][lod]
  }. Return JSON array.`;
//   console.log("Prompt for Gemini:", prompt);
  const generated = await callGemini(prompt);
//   console.log("Generated questions:", generated, " <= Gemini response");
  // Expect generated = [{ text, options: [...], correct: idx }, ...]
//   console.log("Generated questions:", generated);

const formattedQuestions = generated.map((q) => ({
    subject: subjectId,
    topic: topicIds[0], // or assign appropriately if multiple topics
    text: q.question || q.text,
    options: q.options,
    correct: q.correct_index ?? q.correct,
    lod,
    createdBy: req.user?._id,
}));
  res.json(formattedQuestions);;
});

// @desc    Upload questions from file
// @route   POST /api/admin/upload-questions
// @access  Private

const uploadQuestions = asyncHandler(async (req, res) => {
  const { subjectId, topicId, questions, userEmail } = req.body;
  const user = await User.findOne({ email: userEmail });
  const userId = user ? user._id : null;

  const docs = questions.map((q) => ({
    subject: subjectId,
    topic: topicId,
    text: q.text,
    options: q.options,
    correct: q.correct,
    lod: q.lod ?? 3,
    createdBy: userId,
  }));
  const result = await Question.insertMany(docs);
  res.status(201).json({ inserted: result.length });
});

export { getSubjects, addTopic, getTopics, generateQuestions, uploadQuestions };
