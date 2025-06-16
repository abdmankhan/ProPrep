import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./config/db.js";
connectDB();
const PORT = process.env.PORT || 5556;
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import testsRoutes from "./routes/testsRoutes.js";

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3333",
      "https://pro-prep-nine.vercel.app",
      "https://vercel.com/abdmankhans-projects/pro-prep/EtLvbDFB2jiALJeN9tw87TaBSkbX",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// RestAPI Routes

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tests", testsRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "I am working fine at http://localhost:5555/",
    })
});

app.listen(PORT,()=> console.log(`Server is running on port ${PORT}`));