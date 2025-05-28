import asyncHandler from "express-async-handler";
import path from "path";
import fs from "fs/promises";

// @desc Get all questions
// @route GET /api/questions
// @access Private
const getQuestions = asyncHandler(async (req, res) => {
  // console.log(req.cookies);
  const filePath = path.join(process.cwd(), "public", "data", "questions.json");
  const json = await fs.readFile(filePath, "utf-8");
  const questions = JSON.parse(json);
  console.log(questions);

  // Strip out the correct field so answers can't be seen
  const safeQuestions = questions.slice(0,2).map(({ id, text, options }) => ({
    id,
    text,
    options,
  }));
  res.json(safeQuestions);
});

// @desc Submit answers
// @route POST /api/questions/submit
// @access Private
const submitAnswers = asyncHandler(async (req, res) => {
  const { answers } = req.body; // { q1: 2, q2: 1, ... }
  const filePath = path.join(process.cwd(), "public", "data", "questions.json");
  const json = await fs.readFile(filePath, "utf-8");
  const questions = JSON.parse(json);
  let score = 0;
  questions.slice(0, 2).forEach((q) => {
    if (answers[q.id] === q.correct) score++;
  });
  res.json({ total: questions.length, score });
})


export { getQuestions, submitAnswers };
