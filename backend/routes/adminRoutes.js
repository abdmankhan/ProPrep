import express from 'express';
import { getSubjects,
  addTopic, 
  getTopics, 
  generateQuestions, 
  uploadQuestions } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/subjects", protect, getSubjects);
router.post("/topics", protect, addTopic);
router.get("/topics", protect, getTopics);

router.post("/generate-questions", protect, generateQuestions);

router.post("/upload-questions", protect, uploadQuestions);

export default router;

