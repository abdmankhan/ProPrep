import asyncHandler from "express-async-handler";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import { callGemini } from "../utils/gemini.js";

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
// const uploadQuestions = asyncHandler(async (req, res) => {
//   const { subjectId, topicId, questions, userEmail } = req.body;
//   console.log("Received request data:", {
//     subjectId,
//     topicId,
//     questionsCount: questions?.length,
//     sampleQuestion: questions?.[0],
//   });

//   const user = await User.findOne({ email: userEmail });
//   const userId = user ? user._id : null;

//   // Get the topic information for the default topic
//   const defaultTopic = await Topic.findById(topicId);

//   if (!Array.isArray(questions) || questions.length === 0) {
//     return res.status(400).json({ error: "No valid questions provided" });
//   }

//   const docs = questions.map((q) => {
//     // Properly handle the topics array
//     let questionTopics = [];

//     // If topics is a valid array with topicId and topicName
//     if (Array.isArray(q.topics) && q.topics.length > 0) {
//       // Check if topics have the required structure
//       if (q.topics[0].topicId) {
//         // Already in correct format with topicId and topicName
//         questionTopics = q.topics;
//       } else {
//         // Fallback to default topic
//         questionTopics = [
//           {
//             topicId,
//             topicName: defaultTopic?.name || "Unknown",
//           },
//         ];
//       }
//     } else {
//       // No topics array, use default
//       questionTopics = [
//         {
//           topicId,
//           topicName: defaultTopic?.name || "Unknown",
//         },
//       ];
//     }

//     return {
//       subject: subjectId,
//       topics: questionTopics,
//       text: q.text || "",
//       options: Array.isArray(q.options) ? q.options : [],
//       correct: typeof q.correct === "number" ? q.correct : 0,
//       lod: typeof q.lod === "number" ? q.lod : 3,
//       questionType: q.questionType || "MCQ",
//       createdBy: userId,
//     };
//   });

//   try {
//     const result = await Question.insertMany(docs);
//     console.log(`Successfully inserted ${result.length} questions`);
//     res.status(201).json({ inserted: result.length });
//   } catch (error) {
//     console.error("Error inserting questions:", error);
//     res.status(400).json({
//       error: error.message,
//       details: error.errors,
//       sampleQuestion: docs[0],
//     });
//   }
// });
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

export { getSubjects, addTopic, getTopics, generateQuestions, uploadQuestions };
