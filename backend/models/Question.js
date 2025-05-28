import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct: { type: Number, min: 0, max: 3, required: true }, // index 0–3
    lod: { type: Number, enum: [0, 1, 2, 3], default: 3 }, // 0: easy … 3: mixed
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
