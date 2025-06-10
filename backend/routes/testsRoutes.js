import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  fetchTest,
  fetchTests,
  submitTest,
  fetchQuestions,
  fetchTestResultById,
  fetchLeaderboardForTest,
  fetchTakenTestIds,
  fetchUserAnalytics,
} from "../controllers/testsController.js";

const router = express.Router();

router.get("/", fetchTests);
router.post("/questions", protect, fetchQuestions);
router.post("/submit/:id", protect, submitTest);
router.post("/result", protect, fetchTestResultById);
router.get("/leaderboard/:testId", protect, fetchLeaderboardForTest);
router.get("/taken", protect, fetchTakenTestIds);
router.get("/user/analytics", protect, fetchUserAnalytics);

router.post("/:id", protect, fetchTest);

export default router;
