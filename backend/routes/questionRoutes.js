import express from "express";
import { getQuestions, submitAnswers } from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", protect, getQuestions);
router.post("/submit", protect, submitAnswers);

export default router;
