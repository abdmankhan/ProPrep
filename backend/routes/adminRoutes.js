import express from 'express';
import { getSubjects,
  addTopic, 
  getTopics, 
  generateQuestions, 
  uploadQuestions } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const mcqRouter = express.Router();
router.use('/mcq', mcqRouter);



mcqRouter.get("/subjects", protect, getSubjects);
mcqRouter.post("/topics", protect, addTopic);
mcqRouter.get("/topics", protect, getTopics);

mcqRouter.post("/generate-questions", protect, generateQuestions);

mcqRouter.post("/upload-questions", protect, uploadQuestions);

export default router;

