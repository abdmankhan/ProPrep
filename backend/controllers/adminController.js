import asyncHandler from "express-async-handler";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Test from "../models/Test.js";
import { callGemini } from "../utils/gemini.js";
import mongoose from "mongoose";

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
  const { subjectId, topicIds, lod, count, questionType } = req.body;

  const subject = await Subject.findById(subjectId);
  const topics = await Topic.find({ _id: { $in: topicIds } });

  // Create a mapping of topic names to IDs for later use
  const topicMap = {};
  topics.forEach((topic) => {
    topicMap[topic.name] = topic._id;
  });

  // Include topic IDs in the prompt
  const topicsInfo = topics.map((t) => `${t.name} (ID: ${t._id})`).join(", ");

  const prompt = `Generate ${count} ${
    questionType || "MCQ"
  }s with the following requirements:
  - Subject: ${subject.name}
  - Topics: ${topics.map((t) => t.name).join(", ")}
  - Difficulty level: ${["easy", "medium", "hard", "mixed"][lod]}
  - Question type: ${questionType || "MCQ"}
  
  For each question, please specify which topics from the list above are covered by that question (one or more).
  
  Return a JSON array where each object has the following structure:
  {
    "question": "The question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0, // Index of the correct answer (0-3)
    "topics": ["Topic Name 1", "Topic Name 2"] // List of topic names that this question covers (from the provided list)
  }`;

  const generated = await callGemini(prompt);

  if (!Array.isArray(generated)) {
    return res.status(500).json({ error: "Invalid response from AI service" });
  }

  const formattedQuestions = generated.map((q) => {
    // Map the topic names to their corresponding IDs and create the topics array
    const questionTopics = Array.isArray(q.topics)
      ? q.topics
          .map((topicName) => {
            const topicId = topicMap[topicName];
            return topicId ? { topicId, topicName } : null;
          })
          .filter(Boolean) // Remove any null entries
      : [];

    // If no valid topics were found, use the first topic from the request
    if (questionTopics.length === 0 && topicIds.length > 0) {
      const defaultTopic = topics[0];
      if (defaultTopic) {
        questionTopics.push({
          topicId: defaultTopic._id,
          topicName: defaultTopic.name,
        });
      }
    }

    return {
      subject: subjectId,
      topics: questionTopics,
      text: q.question || q.text,
      options: q.options,
      correct: q.correctIndex ?? q.correct,
      lod,
      questionType: questionType || "MCQ", // Use the requested question type
      createdBy: req.user?._id,
    };
  });
  // console.log("Formatted Questions:", formattedQuestions);
  res.json(formattedQuestions);
});

// @desc    Upload questions from file
// @route   POST /api/admin/mcq/upload-questions
// @access  Private
const uploadQuestions = async (req, res) => {
  try {
    const { subjectId, questions, userEmail } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "No questions provided." });
    }

    let createdByUser = null;

    if (userEmail) {
      const user = await User.findOne({ email: userEmail });
      if (user) createdByUser = user._id;
    }

    const formattedQuestions = questions.map((q) => {
      // Validate topics array
      const topics =
        Array.isArray(q.topics) &&
        q.topics.every((t) => t.topicId && t.topicName)
          ? q.topics.map((t) => ({
              topicId: t.topicId,
              topicName: t.topicName,
            }))
          : [];

      return {
        subject: subjectId,
        text: q.text,
        options: q.options,
        correct: q.correct,
        lod: q.lod,
        topics,
        createdBy: createdByUser,
        questionType: q.questionType || "Unknown",
      };
    });

    const savedQuestions = await Question.insertMany(formattedQuestions);

    res.status(201).json({
      message: `${savedQuestions.length} questions uploaded successfully.`,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Server error during upload." });
  }
};

// @desc    Generate a test based on selected subject
// @route   POST /api/admin/mcq/generate-test
// @access  Private
const getTestQuestions = asyncHandler(async (req, res) => {
  const {subjectIds, lod, count} = req.body;
  const questions = await Question.aggregate([
    {
      $match: {
        subject: {
          $in: subjectIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        lod: lod,
      },
    },
    { $sample: { size: count } },
    {
      $project: {
        text: 1,
        options: 1,
        correct: 1,
      },
    },
  ]);
  if (questions.length === 0) {
    return res.status(404).json({ error: "No questions found for the selected criteria." });
  }

  res.json(questions);
})

// @desc    Generate a test based on selected subject
// @route   POST /api/admin/mcq/generate-test
// @access  Private
const generateTest = asyncHandler( async (req, res) => {
  const { name, subjectIds, questionIds, totalQuestions, timeLimit, shuffleQuestions, shuffleOptions } = req.body;
  
  // if (!name || !subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
  //   return res.status(400).json({ error: "Invalid test data provided." });
  // }

  const test = await Test.create({
    name,
    subjects: subjectIds.map(id => new mongoose.Types.ObjectId(id)),
    questionIds: questionIds.map(id => new mongoose.Types.ObjectId(id)),
    totalQuestions,
    timeLimit,
    shuffleQuestions,
    shuffleOptions,
    createdBy: req.user?._id,
  });

  res.status(201).json(test);
})

export { getSubjects, addTopic, getTopics, generateQuestions, uploadQuestions, getTestQuestions, generateTest };
