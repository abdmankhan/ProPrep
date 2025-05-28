import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. 'OS'
  },
  { timestamps: true }
);

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;