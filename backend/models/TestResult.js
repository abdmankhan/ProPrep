import mongoose from "mongoose";

const TestResultSchema = new mongoose.Schema({
  test_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  test_name: { type: String },
  taken_by_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  taken_by_user_email: { type: String, required: true },
  user_name: { type: String },
  score: { type: Number, required: true },
  totalQuestions: { type: Number },
  percentage: { type: Number },
  timeTaken: { type: Number, required: true },
  taken_date_time: { type: Date, default: Date.now },
  answers: [
    { questionId: mongoose.Schema.Types.ObjectId, answerIndex: Number },
  ],
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  completed: { type: Boolean, default: true },
  device_info: { type: String },
  ip_address: { type: String },
});

export default mongoose.model("TestResult", TestResultSchema);
