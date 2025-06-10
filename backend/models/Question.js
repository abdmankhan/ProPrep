import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    // Change from single topic to array of topics
    topics: [
      {
        topicId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
          required: true,
        },
        topicName: { type: String, required: true },
      },
    ],
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct: { type: Number, min: 0, max: 3, required: true }, // index 0–3
    lod: { type: Number, enum: [0, 1, 2, 3], default: 3 }, // 0: easy … 3: mixed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Add question type
    questionType: {
      type: String,
      enum: ["MCQ", "Multiple Correct", "Type in the answer(TITA)", "Unknown"],
      default: "MCQ",
    },
    explanation: { type: String }, // <-- add explanation field
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
