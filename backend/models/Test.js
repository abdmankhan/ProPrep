import mongoose from "mongoose";


const testSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    totalQuestions: { type: Number, required: true },
    timeLimit: { type: Number, required: true }, // in minutes
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);
export default Test;