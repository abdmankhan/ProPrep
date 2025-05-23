import express from "express";
import { signup, login, logout, googleSignin, getProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/getProfile", protect, getProfile);
router.post("/google", googleSignin);


export default router;